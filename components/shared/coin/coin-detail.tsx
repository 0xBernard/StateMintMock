'use client';

import * as React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/context/auth-context';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useFinancial } from '@/lib/context/financial-context';
import { useMarket } from '@/lib/context/market-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoinData } from '@/lib/data/coins';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, History, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { calculatePurchaseBreakdown } from '@/lib/data/market';
import { formatNumber, formatCurrency, safeMultiply, formatPercentage } from '@/lib/utils/number-formatting';

interface CoinDetailProps {
  coin: CoinData;
}

export function CoinDetail({ coin }: CoinDetailProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { holdings, addShares, removeShares } = usePortfolio();
  const { availableBalance, withdraw, addTransaction } = useFinancial();
  const { getAvailableShares, purchaseShares, addUserListing } = useMarket();
  const [tradeType, setTradeType] = React.useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = React.useState('');
  const [listingPrice, setListingPrice] = React.useState('');
  const [futureSellPrice, setFutureSellPrice] = React.useState('');

  const userHolding = holdings.find(h => h.coinId === coin.id);
  const sharesOwned = userHolding?.shares || 0;
  const availableShares = getAvailableShares(coin.id);

  // Calculate purchase breakdown when buying
  const purchaseBreakdown = React.useMemo(() => {
    if (tradeType !== 'buy' || !shares || isNaN(parseInt(shares))) {
      console.log('Purchase breakdown skipped due to invalid inputs:', { tradeType, shares });
      return null;
    }
    
    const parsedShares = parseInt(shares);
    console.log('Calculating purchase breakdown:', { 
      availableShares: JSON.stringify(availableShares), 
      parsedShares,
      availableSharesLength: availableShares.length 
    });
    
    const result = calculatePurchaseBreakdown(availableShares, parsedShares);
    console.log('Purchase breakdown calculation result:', JSON.stringify(result, null, 2));
    return result;
  }, [tradeType, shares, availableShares]);

  // Format market price display
  const formattedMarketPrice = React.useMemo(() => {
    return formatCurrency(coin.market.currentMarketPrice);
  }, [coin.market.currentMarketPrice]);

  // Format shares sold percentage
  const formattedSharesSoldPercentage = React.useMemo(() => {
    return formatPercentage((coin.soldShares / coin.totalShares) * 100);
  }, [coin.soldShares, coin.totalShares]);

  // Render purchase breakdown
  const renderPurchaseBreakdown = () => {
    console.log('Rendering purchase breakdown, received:', JSON.stringify(purchaseBreakdown, null, 2));
    
    // Early return if no purchase breakdown or invalid structure
    if (!purchaseBreakdown) {
      console.log('No purchase breakdown available');
      return null;
    }

    if (!Array.isArray(purchaseBreakdown.breakdown)) {
      console.error('Invalid breakdown array:', purchaseBreakdown);
      return (
        <div className="text-sm text-red-500 p-3 bg-destructive/10 rounded-lg">
          Unable to calculate purchase breakdown. Please try a different quantity.
        </div>
      );
    }

    try {
      // Validate and sanitize the breakdown items
      const safeBreakdown = purchaseBreakdown.breakdown
        .filter(item => item && typeof item === 'object')
        .map((item, index) => {
          // Log the actual item for debugging
          console.log(`Processing breakdown item ${index}:`, JSON.stringify(item));
          
          return {
            quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0,
            price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0,
            subtotal: typeof item.subtotal === 'number' && !isNaN(item.subtotal) ? item.subtotal : 0
          };
        });

      if (safeBreakdown.length === 0) {
        console.error('No valid breakdown items after sanitization');
        return (
          <div className="text-sm text-red-500 p-3 bg-destructive/10 rounded-lg">
            Unable to process purchase breakdown. Please try again.
          </div>
        );
      }

      // Calculate totals from safe breakdown
      const safeTotalCost = safeBreakdown.reduce((sum, item) => sum + item.subtotal, 0);
      const safeTotalShares = safeBreakdown.reduce((sum, item) => sum + item.quantity, 0);
      const safeAveragePrice = safeTotalShares > 0 ? safeTotalCost / safeTotalShares : 0;
      const tradingFee = safeMultiply(safeTotalCost, 0.005);
      const total = safeMultiply(safeTotalCost, 1.005);

      console.log('Final safe values for rendering:', {
        safeBreakdown,
        safeTotalCost,
        safeAveragePrice,
        tradingFee,
        total
      });

      return (
        <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
          <div className="space-y-3 mb-3">
            <div className="text-sm text-muted-foreground">Purchase Breakdown:</div>
            {safeBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{formatNumber(item.quantity, 0)} shares @ {formatCurrency(item.price)}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span>Average Price Per Share</span>
            <span>{formatCurrency(safeAveragePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(safeTotalCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Trading Fee (0.5%)</span>
            <span>{formatCurrency(tradingFee)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering purchase breakdown:', error);
      return (
        <div className="text-sm text-red-500 p-3 bg-destructive/10 rounded-lg">
          Error displaying purchase breakdown. Please try again with a different quantity.
        </div>
      );
    }
  };

  // Render sell breakdown
  const renderSellBreakdown = () => {
    if (!shares || !listingPrice) return null;

    const numShares = parseFloat(shares);
    const numPrice = parseFloat(listingPrice);

    if (isNaN(numShares) || isNaN(numPrice)) return null;

    const totalValue = safeMultiply(numShares, numPrice);
    const tradingFee = safeMultiply(totalValue, 0.005);
    const youllReceive = totalValue - tradingFee;

    return (
      <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Value</span>
          <span>{formatCurrency(totalValue)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Trading Fee (0.5%)</span>
          <span>{formatCurrency(tradingFee)}</span>
        </div>
        <div className="flex justify-between font-semibold border-t border-border pt-2 mt-2">
          <span>You'll Receive</span>
          <span>{formatCurrency(youllReceive)}</span>
        </div>
      </div>
    );
  };

  // Validate share quantity
  const validateShares = (value: string): string | null => {
    const numShares = parseInt(value);
    if (isNaN(numShares)) return "Please enter a valid number";
    if (numShares <= 0) return "Quantity must be greater than 0";
    if (numShares % 1 !== 0) return "Only whole shares are allowed";
    if (tradeType === 'sell' && numShares > sharesOwned) return "You don't own enough shares";
    return null;
  };

  // Validate listing price
  const validateListingPrice = (price: string): string | null => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "Please enter a valid price";
    if (numPrice <= 0) return "Price must be greater than 0";
    return null;
  };

  // Handle share input change
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateShares(value);
    if (!error || !value) {
      setShares(value);
    }
  };

  // Handle future sell price change
  const handleFutureSellPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value and typing
    setFutureSellPrice(value);
  };

  // Format price on blur
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setFutureSellPrice('');
      return;
    }
    // Only format if there are decimals
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (value.includes('.')) {
        setFutureSellPrice(numValue.toFixed(2));
      } else {
        setFutureSellPrice(value);
      }
    }
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tradeType === 'buy' && purchaseBreakdown) {
      const totalCost = purchaseBreakdown.totalCost * 1.005; // Including 0.5% fee
      
      // Try to withdraw the funds
      const success = withdraw(totalCost);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Insufficient funds",
          description: "You don't have enough funds to complete this purchase."
        });
        return;
      }

      // Execute the purchase
      const purchase = purchaseShares(coin.id, parseInt(shares), Number.MAX_VALUE);
      if (!purchase?.success) {
        toast({
          variant: "destructive",
          title: "Purchase failed",
          description: "The requested shares are no longer available at this price."
        });
        return;
      }

      // Add shares to portfolio
      addShares(
        coin.id,
        parseInt(shares),
        purchase.averagePrice, // Use the actual purchase price from the executed trade
        futureSellPrice ? parseFloat(futureSellPrice) : null
      );

      // Add the purchase transaction
      addTransaction({
        type: 'purchase',
        amount: totalCost,
        details: `Purchased ${shares} shares of ${coin.name}`
      });

      // If user wants to list these shares after purchase
      if (futureSellPrice) {
        const numPrice = parseFloat(futureSellPrice);
        if (!validateListingPrice(futureSellPrice)) {
          addUserListing(coin.id, numPrice, parseInt(shares));
        }
      }

      toast({
        title: "Purchase successful",
        description: `You have purchased ${shares} shares of ${coin.name}`
      });

      // Reset form
      setShares('');
      setListingPrice('');
      setFutureSellPrice('');
    } else if (tradeType === 'sell') {
      const priceError = validateListingPrice(listingPrice);
      if (priceError) {
        toast({
          variant: "destructive",
          title: "Invalid listing price",
          description: priceError
        });
        return;
      }

      const numShares = parseInt(shares);
      const numPrice = parseFloat(listingPrice);

      if (numShares > sharesOwned) {
        toast({
          variant: "destructive",
          title: "Invalid quantity",
          description: "You don't own enough shares"
        });
        return;
      }

      // Remove shares from portfolio
      const removed = removeShares(coin.id, numShares);
      if (!removed) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not remove shares from portfolio"
        });
        return;
      }

      // Add the listing
      addUserListing(coin.id, numPrice, numShares);
      
      toast({
        title: "Shares listed",
        description: `${numShares} shares listed at $${numPrice.toFixed(2)}`
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Coin Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative w-full md:w-96 aspect-[2/1] rounded-lg overflow-hidden bg-black/20">
          <Image
            src={coin.image}
            alt={coin.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 384px"
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{coin.name}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold",
                coin.rarity === 'legendary' ? "bg-amber-500/20 text-amber-500" :
                coin.rarity === 'rare' ? "bg-purple-500/20 text-purple-500" :
                "bg-blue-500/20 text-blue-500"
              )}>
                {coin.rarity.charAt(0).toUpperCase() + coin.rarity.slice(1)}
              </span>
            </div>
            <p className="text-lg text-muted-foreground">{coin.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Current Share Price</CardDescription>
                <CardTitle className="text-2xl">{formattedMarketPrice}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Total Shares</CardDescription>
                <CardTitle className="text-2xl">{coin.totalShares.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Shares Sold</CardDescription>
                <CardTitle className="text-2xl">
                  {coin.soldShares.toLocaleString()} ({formattedSharesSoldPercentage}%)
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="orderbook" className="w-full">
            <TabsList>
              <TabsTrigger value="orderbook">Order Book</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
              <TabsTrigger value="details">Coin Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orderbook" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-red-500" />
                    Available Shares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableShares
                      .sort((a, b) => a.price - b.price)
                      .map((listing, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-red-500">{formatCurrency(listing.price)}</span>
                          <span>{listing.quantity} shares</span>
                          <span className={cn(
                            "text-muted-foreground",
                            listing.isUserListing && "text-amber-500"
                          )}>
                            {listing.isOriginalShares ? 'Platform' : listing.isUserListing ? 'Your Listing' : 'User'}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Previous Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coin.previousSales.map((sale, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span>{sale.year}</span>
                        <span className="text-lg font-semibold">{formatCurrency(sale.price)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Grade</dt>
                      <dd className="text-lg font-semibold">{coin.grade}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Top Graded Population</dt>
                      <dd className="text-lg font-semibold">{coin.topGradedPopulation}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Total Mintage</dt>
                      <dd className="text-lg font-semibold">{coin.totalMintage.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Gem Survival Estimate</dt>
                      <dd className="text-lg font-semibold">{coin.gemSurvivalEstimate.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Annual Appreciation</dt>
                      <dd className="text-lg font-semibold">{coin.annualAppreciation}%</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Current Owners</dt>
                      <dd className="text-lg font-semibold">{coin.owners.toLocaleString()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Trade {coin.name}</CardTitle>
              {!user && (
                <CardDescription className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  Please login to trade
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTradeSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={tradeType === 'buy' ? 'default' : 'outline'}
                    onClick={() => setTradeType('buy')}
                    className="w-full"
                  >
                    Buy
                  </Button>
                  <Button
                    type="button"
                    variant={tradeType === 'sell' ? 'default' : 'outline'}
                    onClick={() => setTradeType('sell')}
                    className="w-full"
                    disabled={!sharesOwned}
                  >
                    Sell
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shares">Number of Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    min="1"
                    step="1"
                    value={shares}
                    onChange={handleSharesChange}
                    disabled={!user}
                    placeholder="Enter whole number of shares"
                  />
                  {shares && validateShares(shares) && (
                    <div className="text-sm text-red-500">
                      {validateShares(shares)}
                    </div>
                  )}
                  {tradeType === 'sell' && (
                    <div className="text-sm text-muted-foreground">
                      You own {sharesOwned} shares
                    </div>
                  )}
                </div>

                {tradeType === 'buy' && (
                  <div className="space-y-2">
                    <Label htmlFor="futureSellPrice">List These Shares For (Optional)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-muted-foreground">{futureSellPrice ? '$' : ''}</span>
                      </div>
                      <Input
                        id="futureSellPrice"
                        type="text"
                        pattern="^\d*\.?\d{0,2}$"
                        inputMode="decimal"
                        className="pl-7"
                        value={futureSellPrice}
                        onChange={handleFutureSellPriceChange}
                        onBlur={handlePriceBlur}
                        disabled={!user}
                        placeholder="Enter price"
                      />
                    </div>
                    {futureSellPrice && validateListingPrice(futureSellPrice) && (
                      <div className="text-sm text-red-500">
                        {validateListingPrice(futureSellPrice)}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      These shares will be listed in the orderbook at this price after purchase
                    </div>
                  </div>
                )}

                {tradeType === 'sell' && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Listing Price</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-muted-foreground">{listingPrice ? '$' : ''}</span>
                      </div>
                      <Input
                        id="price"
                        type="text"
                        pattern="^\d*\.?\d{0,2}$"
                        inputMode="decimal"
                        className="pl-7"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (!value) {
                            setListingPrice('');
                            return;
                          }
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            if (value.includes('.')) {
                              setListingPrice(numValue.toFixed(2));
                            } else {
                              setListingPrice(value);
                            }
                          }
                        }}
                        disabled={!user}
                        placeholder="Enter price"
                      />
                    </div>
                    {listingPrice && validateListingPrice(listingPrice) && (
                      <div className="text-sm text-red-500">
                        {validateListingPrice(listingPrice)}
                      </div>
                    )}
                  </div>
                )}

                {tradeType === 'buy' && shares && purchaseBreakdown && renderPurchaseBreakdown()}
                {tradeType === 'sell' && shares && listingPrice && renderSellBreakdown()}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!user || !shares || (tradeType === 'sell' && !listingPrice) || (tradeType === 'buy' && !purchaseBreakdown)}
                >
                  {tradeType === 'buy' 
                    ? `Buy ${shares} Shares` 
                    : `List ${shares} Shares for Sale`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
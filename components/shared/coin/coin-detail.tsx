'use client';

import * as React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/context/auth-context';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useFinancial } from '@/lib/context/financial-context';
import { useMarket } from '@/lib/context/market-context';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoinData } from '@/lib/data/coins';
import { cn } from '@/lib/utils';
import { debug } from '@/lib/utils/debug';

import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, History, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { calculatePurchaseBreakdown } from '@/lib/data/market';
import { formatNumber, formatCurrency, safeMultiply, formatPercentage, parseNumberWithCommas, formatNumberInput } from '@/lib/utils/number-formatting';

interface CoinDetailProps {
  coin: CoinData;
}

export function CoinDetail({ coin }: CoinDetailProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { holdings, addShares, removeShares } = usePortfolio();
  const { availableBalance, withdraw, addTransaction } = useFinancial();
  const { getAvailableShares, getUserListings, purchaseShares, addUserListing, editUserListing } = useMarket();
  const { state, dispatch, currentStep } = useTutorial();
  const [tradeType, setTradeType] = React.useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = React.useState('');
  const [listingPrice, setListingPrice] = React.useState('');
  const [futureSellPrice, setFutureSellPrice] = React.useState('');
  const [editingListing, setEditingListing] = React.useState<{ price: number; newPrice: string } | null>(null);
  const [activeTab, setActiveTab] = React.useState('orderbook');

  const userHolding = holdings.find(h => h.coinId === coin.id);
  const sharesOwned = userHolding?.shares || 0;
  const availableShares = getAvailableShares(coin.id);
  const userListings = getUserListings(coin.id);

  // Tutorial-driven tab switching
  React.useEffect(() => {
    if (!state.isActive || !currentStep) return;

    switch (currentStep.id) {
      case 'coin-detail-overview':
        setActiveTab('orderbook');
        break;
      case 'coin-history-tab-highlight':
        setActiveTab('history');
        break;
      case 'coin-details-tab-highlight':
        setActiveTab('details');
        break;
    }
  }, [state.isActive, currentStep?.id]);

  // Purchase breakdown calculation
  const purchaseBreakdown = React.useMemo(() => {
    if (tradeType !== 'buy' || !shares || isNaN(parseNumberWithCommas(shares))) {
      debug.log('Purchase breakdown skipped due to invalid inputs:', { tradeType, shares });
      return null;
    }
    
    const parsedShares = Math.floor(parseNumberWithCommas(shares));
    
    // Check if there are any available shares
    if (!availableShares || availableShares.length === 0) {
      debug.log('No available shares for purchase breakdown');
      return null;
    }
    
    // Filter out user's own listings from available shares
    const purchasableShares = availableShares.filter(share => !share.isUserListing);
    
    if (purchasableShares.length === 0) {
      debug.log('No purchasable shares (all are user listings)');
      return null;
    }
    
    debug.log('Calculating purchase breakdown:', { parsedShares, availableSharesLength: purchasableShares.length });
    
    const result = calculatePurchaseBreakdown(purchasableShares, parsedShares);
    debug.log('Purchase breakdown calculation result:', JSON.stringify(result, null, 2));
    return result;
  }, [tradeType, shares, availableShares]);

  // Format market price display - use lowest available price if available
  const formattedMarketPrice = React.useMemo(() => {
    if (availableShares && availableShares.length > 0) {
      const lowestPrice = Math.min(...availableShares.map(share => share.price));
      return formatCurrency(lowestPrice);
    }
    return formatCurrency(coin.market.currentMarketPrice);
  }, [availableShares, coin.market.currentMarketPrice]);

  // Format shares sold percentage
  const formattedSharesSoldPercentage = React.useMemo(() => {
    return formatPercentage((coin.soldShares / coin.totalShares) * 100);
  }, [coin.soldShares, coin.totalShares]);

  // Render purchase breakdown
  const renderPurchaseBreakdown = () => {
    debug.log('Rendering purchase breakdown, received:', JSON.stringify(purchaseBreakdown, null, 2));
    
    // Early return if no purchase breakdown or invalid structure
    if (!purchaseBreakdown) {
      debug.log('No purchase breakdown available');
      return null;
    }

    if (!Array.isArray(purchaseBreakdown.breakdown)) {
      debug.error('Invalid breakdown array:', purchaseBreakdown);
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
          debug.log(`Processing breakdown item ${index}:`, JSON.stringify(item));
          
          return {
            quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0,
            price: typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0,
            subtotal: typeof item.subtotal === 'number' && !isNaN(item.subtotal) ? item.subtotal : 0
          };
        });

      if (safeBreakdown.length === 0) {
        debug.error('No valid breakdown items after sanitization');
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

      debug.log('Final safe values for rendering:', {
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
      debug.error('Error rendering purchase breakdown:', error);
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

    const numShares = parseNumberWithCommas(shares);
    const numPrice = parseNumberWithCommas(listingPrice);

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
    const numShares = parseNumberWithCommas(value);
    if (isNaN(numShares)) return "Please enter a valid number";
    if (numShares <= 0) return "Quantity must be greater than 0";
    if (numShares % 1 !== 0) return "Only whole shares are allowed";
    if (tradeType === 'sell' && numShares > sharesOwned) return "You don't own enough shares";
    return null;
  };

  // Validate listing price
  const validateListingPrice = (price: string): string | null => {
    const numPrice = parseNumberWithCommas(price);
    if (isNaN(numPrice)) return "Please enter a valid price";
    if (numPrice <= 0) return "Price must be greater than 0";
    return null;
  };

  // Handle share input change
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatNumberInput(rawValue);
    setShares(formattedValue);
  };

  // Handle future sell price change
  const handleFutureSellPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatNumberInput(rawValue);
    setFutureSellPrice(formattedValue);
  };

  // Format price on blur
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setFutureSellPrice('');
      return;
    }
    // Parse the number and format with proper decimals
    const numValue = parseNumberWithCommas(value);
    if (!isNaN(numValue)) {
      if (value.includes('.')) {
        setFutureSellPrice(formatNumberInput(numValue.toFixed(2)));
      } else {
        setFutureSellPrice(formatNumberInput(value));
      }
    }
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tradeType === 'buy' && purchaseBreakdown) {
      const totalCost = purchaseBreakdown.totalCost * 1.005; // Including 0.5% fee
      
      // Check if there are enough shares available (excluding user's own listings)
      const purchasableShares = availableShares.filter(share => !share.isUserListing);
      const totalAvailableShares = purchasableShares.reduce((sum, listing) => sum + listing.quantity, 0);
      const requestedShares = Math.floor(parseNumberWithCommas(shares));
      
      if (requestedShares > totalAvailableShares) {
        toast({
          variant: "destructive",
          title: "Insufficient shares available",
          description: `Only ${totalAvailableShares} shares are available for purchase (excluding your own listings).`
        });
        return;
      }
      
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
      const purchase = purchaseShares(coin.id, requestedShares, Number.MAX_VALUE);
      if (!purchase?.success) {
        toast({
          variant: "destructive",
          title: "Purchase failed",
          description: "The requested shares are no longer available at this price."
        });
        // Refund the withdrawn amount since purchase failed
        addTransaction({
          type: 'deposit',
          amount: totalCost,
          details: 'Refund for failed purchase'
        });
        return;
      }

      // Add shares to portfolio
      addShares(
        coin.id,
        requestedShares,
        purchase.averagePrice, // Use the actual purchase price from the executed trade
        futureSellPrice ? parseNumberWithCommas(futureSellPrice) : null
      );

      // Add the purchase transaction
      addTransaction({
        type: 'purchase',
        amount: totalCost,
        details: `Purchased ${shares} shares of ${coin.name}`
      });

      // If user wants to list these shares after purchase
      if (futureSellPrice) {
        const numPrice = parseNumberWithCommas(futureSellPrice);
        const sharesToList = Math.floor(parseNumberWithCommas(shares));
        
        // Check if the user will have enough shares to list after this purchase
        const currentShares = userHolding?.shares || 0;
        const totalSharesAfterPurchase = currentShares + sharesToList;
        
        if (sharesToList > totalSharesAfterPurchase) {
          toast({
            variant: "destructive",
            title: "Invalid listing quantity",
            description: "You cannot list more shares than you will own after this purchase"
          });
          return;
        }
        
        if (!validateListingPrice(futureSellPrice)) {
          addUserListing(coin.id, numPrice, sharesToList);
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

      // Advance tutorial step if we're on the purchase-widget-highlight step
      if (state.isActive && currentStep?.id === 'purchase-widget-highlight') {
        dispatch({ type: 'NEXT_STEP' });
      }
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

      const numShares = Math.floor(parseNumberWithCommas(shares));
      const numPrice = parseNumberWithCommas(listingPrice);

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

      // Advance tutorial step if we're on the purchase-widget-highlight step
      if (state.isActive && currentStep?.id === 'purchase-widget-highlight') {
        dispatch({ type: 'NEXT_STEP' });
      }
    }
  };

  // Handle editing a user listing
  const handleEditListing = (oldPrice: number, newPrice: string) => {
    const numNewPrice = parseNumberWithCommas(newPrice);
    if (isNaN(numNewPrice) || numNewPrice <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid price",
        description: "Please enter a valid price greater than 0"
      });
      return;
    }

    const success = editUserListing(coin.id, oldPrice, numNewPrice);
    if (success) {
      setEditingListing(null);
      toast({
        title: "Listing updated",
        description: `Price changed from $${oldPrice.toFixed(2)} to $${numNewPrice.toFixed(2)}`
      });

      // Advance tutorial step if we're on the purchase-widget-highlight step
      if (state.isActive && currentStep?.id === 'purchase-widget-highlight') {
        dispatch({ type: 'NEXT_STEP' });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Coin Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative w-full md:w-80 aspect-[2/1] rounded-lg overflow-hidden bg-black/20">
          <Image
            src={coin.image}
            alt={coin.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        </div>
        
        <div className="flex-1 space-y-4 sm:space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <h1 className="text-xl sm:text-3xl font-bold">{coin.name}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold w-fit",
                coin.rarity === 'legendary' ? "bg-amber-500/20 text-amber-500" :
                coin.rarity === 'rare' ? "bg-purple-500/20 text-purple-500" :
                "bg-blue-500/20 text-blue-500"
              )}>
                {coin.rarity.charAt(0).toUpperCase() + coin.rarity.slice(1)}
              </span>
            </div>
            <p className="text-sm sm:text-lg text-muted-foreground">{coin.description}</p>
          </div>

          {/* Compact Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-zinc-900/50 rounded-lg p-3 border border-amber-600/30">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Share Price</div>
              <div className="text-sm sm:text-lg font-bold text-amber-400">{formattedMarketPrice}</div>
          </div>
            <div className="bg-zinc-900/50 rounded-lg p-3 border border-amber-600/30">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Total Shares</div>
              <div className="text-sm sm:text-lg font-bold text-amber-400">{coin.totalShares.toLocaleString()}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-3 border border-amber-600/30">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1">Shares Sold</div>
              <div className="text-xs sm:text-base font-bold text-amber-400">
                {coin.soldShares.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">({formattedSharesSoldPercentage})</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="orderbook" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="orderbook" data-tutorial-id="order-book-tab-button">Order Book</TabsTrigger>
              <TabsTrigger value="history" data-tutorial-id="history-tab-button">Trade History</TabsTrigger>
              <TabsTrigger value="details" data-tutorial-id="details-tab-button">Coin Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orderbook" data-tutorial-id="order-book-content-area" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5 text-red-500" />
                      Available Shares
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Total: {availableShares.reduce((sum, listing) => sum + listing.quantity, 0)} shares
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="flex justify-between text-sm font-medium text-muted-foreground border-b border-border pb-2">
                      <span className="flex-1">Price</span>
                      <span className="flex-1 text-center">Quantity</span>
                      <span className="flex-1 text-right">Source</span>
                    </div>
                    {/* Data rows */}
                    {availableShares && availableShares.length > 0 ? (
                      availableShares
                        .sort((a, b) => a.price - b.price)
                        .map((listing, i) => (
                          <div key={i} className={cn(
                            "flex justify-between items-center text-sm py-1",
                            listing.isUserListing && "bg-amber-950/20 border border-amber-600/30 rounded px-2"
                          )}>
                            <span className="flex-1 text-red-500 font-medium">{formatCurrency(listing.price)}</span>
                            <span className="flex-1 text-center">{listing.quantity} shares</span>
                            <span className={cn(
                              "flex-1 text-right",
                              listing.isUserListing ? "text-amber-500" : "text-muted-foreground"
                            )}>
                              {listing.isOriginalShares ? 'Platform' : listing.isUserListing ? 'Your Listing' : 'User'}
                              {listing.isUserListing && (
                                <span className="text-xs block text-amber-400/70">(Cannot purchase)</span>
                              )}
                            </span>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {availableShares && availableShares.length > 0 && availableShares.every(share => share.isUserListing) ? (
                          <>
                            <p>All available shares are your own listings</p>
                            <p className="text-sm mt-1">You cannot purchase your own shares</p>
                          </>
                        ) : (
                          <>
                            <p>No shares currently available for purchase</p>
                            <p className="text-sm mt-1">Check back later or list your shares for sale</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" data-tutorial-id="history-content-area">
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

            <TabsContent value="details" data-tutorial-id="details-content-area">
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
          <Card data-tutorial-id="buy-widget-container">
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
                    type="text"
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
                        pattern="^[\d,]*\.?\d{0,2}$"
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
                        pattern="^[\d,]*\.?\d{0,2}$"
                        inputMode="decimal"
                        className="pl-7"
                        value={listingPrice}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const formattedValue = formatNumberInput(rawValue);
                          setListingPrice(formattedValue);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (!value) {
                            setListingPrice('');
                            return;
                          }
                          const numValue = parseNumberWithCommas(value);
                          if (!isNaN(numValue)) {
                            if (value.includes('.')) {
                              setListingPrice(formatNumberInput(numValue.toFixed(2)));
                            } else {
                              setListingPrice(formatNumberInput(value));
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
                  data-tutorial-id="confirm-purchase-button"
                >
                  {tradeType === 'buy' 
                    ? `Buy ${shares} Shares` 
                    : `List ${shares} Shares for Sale`}
                </Button>
              </form>

              {/* User's Active Listings */}
              {user && userListings.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Your Active Listings</h3>
                  <div className="space-y-2">
                    {userListings.map((listing, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <span className="font-medium">{listing.quantity} shares</span>
                          {editingListing?.price === listing.price ? (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-muted-foreground">New price:</span>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                  type="text"
                                  value={editingListing.newPrice}
                                  onChange={(e) => setEditingListing({ ...editingListing, newPrice: e.target.value })}
                                  className="w-24 pl-6 h-8"
                                  placeholder="0.00"
                                />
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleEditListing(listing.price, editingListing.newPrice)}
                                className="h-8"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="h-8"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground ml-2">at {formatCurrency(listing.price)}</span>
                          )}
                        </div>
                        {editingListing?.price !== listing.price && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingListing({ price: listing.price, newPrice: listing.price.toFixed(2) })}
                            className="text-amber-500 hover:text-amber-400 hover:bg-amber-950/50"
                          >
                            Edit Price
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
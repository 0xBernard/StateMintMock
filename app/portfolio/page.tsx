'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { usePortfolio, ShareHolding } from '@/lib/context/portfolio-context';
import { useFinancial } from '@/lib/context/financial-context';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';
import { coins } from '@/lib/data/coins';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownRight, DollarSign, Lock, Plus, CreditCard, Building2, QrCode, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { Header } from '@/components/shared/layout/header';
import { Sidebar } from '@/components/shared/layout/sidebar';
import { Button } from '@/components/ui/button';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculatePercentageChange(current: number, original: number) {
  return ((current - original) / original) * 100;
}

export default function PortfolioPage() {
  const { isAuthenticated, setShowLoginDialog } = useAuth();
  const router = useRouter();
  const { holdings, getPortfolioValue, getUnrealizedPL } = usePortfolio();
  const { availableBalance, deposit } = useFinancial();
  const { state, dispatch, currentStep } = useTutorial();
  const hasAdvancedRef = useRef(false);
  
  // Add Funds dialog state
  const [showFundsDialog, setShowFundsDialog] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'bank' | 'usdc' | null>(null);
  const mockUSDCAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  // Auto-advance tutorial if we're on portfolio-navigation step and already on portfolio page
  useEffect(() => {
    if (state.isActive && currentStep?.id === 'portfolio-navigation') {
      console.log('Portfolio page loaded while on portfolio-navigation step - auto-advancing');
      // Small delay to ensure the step is fully initialized
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }
  }, [state.isActive, currentStep?.id, dispatch]);

  // Tutorial integration for Add Funds flow
  useEffect(() => {
    console.log('[Portfolio] Tutorial state changed:', {
      isActive: state.isActive,
      currentStepId: currentStep?.id,
      showFundsDialog,
      selectedMethod
    });

    // Auto-advance if dialog is open but tutorial is still on add-funds-button
    if (state.isActive && currentStep?.id === 'add-funds-button' && showFundsDialog) {
      console.log('[Portfolio] Dialog is open but tutorial stuck on add-funds-button - auto-advancing');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }

    // Auto-advance if payment method is selected but tutorial is still on select-payment-method
    if (state.isActive && currentStep?.id === 'select-payment-method' && selectedMethod && showFundsDialog) {
      console.log('[Portfolio] Payment method selected but tutorial stuck on select-payment-method - auto-advancing');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }
  }, [state.isActive, currentStep?.id, showFundsDialog, selectedMethod, dispatch]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0 || !selectedMethod) return;
    
    setIsDepositing(true);
    // Simulate deposit processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    deposit(amount);
    setIsDepositing(false);

    // Advance tutorial if we're on the add-funds-dialog-opened step
    if (currentStep?.id === 'add-funds-dialog-opened') {
      console.log('[Portfolio] Deposit completed during tutorial - advancing step');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }

    // Delay closing the dialog to allow tutorial to advance if needed
    await new Promise(resolve => setTimeout(resolve, 250));

    setShowFundsDialog(false);
    setDepositAmount('');
    setSelectedMethod(null);
  };

  const handleDialogChange = (open: boolean) => {
    console.log('[Portfolio] handleDialogChange called. Open:', open, 'Current step:', currentStep?.id);

    // For preventing dialog closure during tutorial
    if (!open && (currentStep?.id === 'select-payment-method' || currentStep?.id === 'add-funds-dialog-opened')) {
      console.log(`[Portfolio] Attempted to close Add Funds dialog during tutorial step ${currentStep.id}. Preventing.`);
      return;
    }
    
    setShowFundsDialog(open);
    
    // Advance tutorial when dialog opens if we're on the add-funds-button step
    if (open && currentStep?.id === 'add-funds-button') {
      console.log('[Portfolio] Dialog opened during add-funds-button step - advancing to select-payment-method');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 300);
    }
  };

  const handlePaymentMethodSelect = (method: 'card' | 'bank' | 'usdc' | null) => {
    setSelectedMethod(method);
    
    // Advance tutorial if we're on the select-payment-method step and a method was selected
    if (currentStep?.id === 'select-payment-method' && method !== null) {
      console.log('[Portfolio] Payment method selected during tutorial - advancing to add-funds-dialog-opened');
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockUSDCAddress);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const portfolioValue = getPortfolioValue();
  const unrealizedPL = getUnrealizedPL();
  const percentageReturn = calculatePercentageChange(
    portfolioValue,
    portfolioValue - unrealizedPL
  );

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex overflow-x-hidden">
          <Sidebar />
          <div className="flex-1 lg:pl-64 min-w-0">
            <div className="pt-16">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
                <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] text-center space-y-4 sm:space-y-6 w-full">
                  <div className="bg-amber-500/10 p-4 sm:p-6 rounded-full">
                    <Lock className="h-8 w-8 sm:h-12 sm:w-12 text-amber-500" />
                  </div>
                  <div className="space-y-2 px-4 w-full max-w-md">
                    <h1 className="text-xl sm:text-3xl font-bold text-amber-400">Portfolio Access Required</h1>
                    <p className="text-sm sm:text-lg text-muted-foreground">
                      Please sign in to view your portfolio and track your collectible investments.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-black font-semibold px-6 sm:px-8 py-2 sm:py-3"
                  >
                    Sign In to View Portfolio
                  </Button>
                              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Add Funds Dialog */}
      <Dialog open={showFundsDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] mx-auto" data-tutorial-id="add-funds-dialog">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Payment Methods */}
            <div className="space-y-3" data-tutorial-id="payment-methods-section">
              <Label className="text-sm font-medium">Choose payment method</Label>
              <div className="grid gap-3">
                <Button
                  variant={selectedMethod === 'card' ? 'default' : 'outline'}
                  className={`justify-start p-4 h-auto ${selectedMethod === 'card' ? 'bg-amber-600/20 border-amber-600 text-amber-400' : ''}`}
                  onClick={() => handlePaymentMethodSelect('card')}
                  data-tutorial-id="payment-method-card"
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">Instant transfer</div>
                  </div>
                </Button>
                
                <Button
                  variant={selectedMethod === 'bank' ? 'default' : 'outline'}
                  className={`justify-start p-4 h-auto ${selectedMethod === 'bank' ? 'bg-amber-600/20 border-amber-600 text-amber-400' : ''}`}
                  onClick={() => handlePaymentMethodSelect('bank')}
                  data-tutorial-id="payment-method-bank"
                >
                  <Building2 className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-muted-foreground">1-3 business days</div>
                  </div>
                </Button>
                
                <Button
                  variant={selectedMethod === 'usdc' ? 'default' : 'outline'}
                  className={`justify-start p-4 h-auto ${selectedMethod === 'usdc' ? 'bg-amber-600/20 border-amber-600 text-amber-400' : ''}`}
                  onClick={() => handlePaymentMethodSelect('usdc')}
                  data-tutorial-id="payment-method-usdc"
                >
                  <QrCode className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">USDC Deposit</div>
                    <div className="text-sm text-muted-foreground">Crypto wallet transfer</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Amount Input for Card/Bank */}
            {(selectedMethod === 'card' || selectedMethod === 'bank') && (
              <div className="space-y-3" data-tutorial-id="amount-input-section">
                <Label htmlFor="amount" className="text-sm font-medium">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="text-lg"
                  data-tutorial-id="amount-input-field"
                />
                <div className="grid grid-cols-4 gap-2" data-tutorial-id="quick-amounts">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount(amount.toString())}
                      className="text-xs"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* USDC Instructions */}
            {selectedMethod === 'usdc' && (
              <div className="space-y-3" data-tutorial-id="usdc-instructions">
                <Label className="text-sm font-medium">USDC Deposit Address</Label>
                <div className="bg-zinc-900/50 p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Ethereum Network</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="text-sm font-mono bg-black/50 p-2 rounded text-center break-all">
                    {mockUSDCAddress}
                  </div>
                </div>
                <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg">
                  ⚠️ Only send USDC on Ethereum network to this address. Other tokens or networks may result in permanent loss.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4" data-tutorial-id="action-buttons">
              <Button
                variant="outline"
                onClick={() => handleDialogChange(false)}
                className="flex-1"
                disabled={isDepositing}
              >
                Cancel
              </Button>
              
              {selectedMethod === 'usdc' ? (
                <Button
                  onClick={() => handleDialogChange(false)}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-black"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue in Wallet
                </Button>
              ) : (
                <Button
                  onClick={handleDeposit}
                  disabled={!selectedMethod || !depositAmount || parseFloat(depositAmount) <= 0 || isDepositing}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-black disabled:opacity-50"
                  data-tutorial-id="deposit-button"
                >
                  {isDepositing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Deposit ${depositAmount ? `$${depositAmount}` : ''}`
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64 min-w-0">
          <div className="pt-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden" data-tutorial-id="portfolio-main-content-area">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-4xl font-bold text-amber-400" data-tutorial-id="portfolio-page-main-title">Portfolio</h1>
                {/* Mobile Add Funds Button */}
                <Button
                  onClick={() => setShowFundsDialog(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-black font-medium px-3 py-2 sm:px-4 sm:py-2 text-sm lg:hidden"
                  data-tutorial-id="mobile-add-funds-button"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Funds
                </Button>
              </div>

              <div className="space-y-6 sm:space-y-8" data-tutorial-id="portfolio-overview-section">
                {/* Portfolio Summary - Ultra Compact Stats */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-4 w-full" data-tutorial-id="portfolio-stats-summary">
                  <div className="bg-zinc-900/50 rounded-lg p-2 sm:p-4 border border-amber-600/30 min-w-0" data-tutorial-id="portfolio-value-stat">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className="text-xs text-muted-foreground truncate">Portfolio</div>
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 flex-shrink-0" />
                    </div>
                    <div className="text-xs sm:text-lg font-bold text-amber-400 leading-tight truncate">{formatCurrency(portfolioValue)}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">Total value</div>
                  </div>
                  
                  <div className="bg-zinc-900/50 rounded-lg p-2 sm:p-4 border border-amber-600/30 min-w-0" data-tutorial-id="portfolio-performance-stat">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className="text-xs text-muted-foreground truncate">P/L</div>
                      {unrealizedPL >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className={`text-xs sm:text-lg font-bold leading-tight truncate ${unrealizedPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(unrealizedPL)}
                    </div>
                    <div className="text-xs text-muted-foreground">{percentageReturn.toFixed(1)}%</div>
                  </div>
                  
                  <div className="bg-zinc-900/50 rounded-lg p-2 sm:p-4 border border-amber-600/30 min-w-0" data-tutorial-id="portfolio-holdings-count-stat">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className="text-xs text-muted-foreground truncate">Holdings</div>
                      <div className="bg-amber-600/20 p-0.5 sm:p-1 rounded-full flex-shrink-0">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-lg font-bold text-amber-400 leading-tight">{holdings.length}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">Coins owned</div>
                  </div>
                </div>

                {/* Holdings List */}
                <Card className="mt-6 sm:mt-8 w-full min-w-0" data-tutorial-id="portfolio-coin-list-section">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Your Holdings</CardTitle>
                    <CardDescription className="text-sm">
                      A detailed breakdown of your coin shares
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-hidden">
                    <div className="space-y-3 sm:space-y-4 w-full">
                      {holdings.map((holding: ShareHolding) => {
                        const coin = coins.find(c => c.id === holding.coinId)!;
                        const currentValue = coin.market.currentMarketPrice * holding.shares;
                        const costBasis = holding.purchasePrice * holding.shares;
                        const pl = currentValue - costBasis;
                        const plPercentage = calculatePercentageChange(currentValue, costBasis);

                        return (
                          <Button
                            key={holding.coinId}
                            variant="ghost"
                            className="w-full p-0 h-auto hover:bg-accent min-w-0"
                            onClick={() => router.push(`/coin/${holding.coinId}`)}
                          >
                            <div className="flex items-center space-x-3 sm:space-x-4 w-full rounded-lg border p-3 sm:p-4 min-w-0 overflow-hidden">
                              <Avatar className="h-12 w-16 sm:h-16 sm:w-24 rounded-lg">
                                <AvatarImage src={coin.image} alt={coin.name} className="object-cover" />
                                <AvatarFallback className="rounded-lg text-xs sm:text-sm">{coin.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1 text-left min-w-0">
                                <p className="font-medium leading-none text-sm sm:text-base truncate">{coin.name}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {holding.shares} shares @ {formatCurrency(holding.purchasePrice)}/share
                                </p>
                                {holding.desiredSellPrice && (
                                  <p className="text-xs sm:text-sm text-amber-400">
                                    Sell target: {formatCurrency(holding.desiredSellPrice)}/share
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm sm:text-base">{formatCurrency(currentValue)}</p>
                                <p className={`text-xs sm:text-sm ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {pl >= 0 ? '+' : ''}{formatCurrency(pl)} ({plPercentage.toFixed(1)}%)
                                </p>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
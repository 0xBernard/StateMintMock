'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { usePortfolio, ShareHolding } from '@/lib/context/portfolio-context';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';
import { coins } from '@/lib/data/coins';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight, ArrowDownRight, DollarSign, Lock } from 'lucide-react';
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
  const { state, dispatch, currentStep } = useTutorial();
  const hasAdvancedRef = useRef(false);

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
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:pl-64">
            <div className="pt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                  <div className="bg-amber-500/10 p-6 rounded-full">
                    <Lock className="h-12 w-12 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-amber-400">Portfolio Access Required</h1>
                    <p className="text-lg text-muted-foreground max-w-md">
                      Please sign in to view your portfolio and track your collectible investments.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-black font-semibold px-8 py-3"
                  >
                    Sign In to View Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <div className="pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-tutorial-id="portfolio-main-content-area">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-amber-400" data-tutorial-id="portfolio-page-main-title">Portfolio</h1>
              </div>

              <div className="space-y-8" data-tutorial-id="portfolio-overview-section">
                {/* Portfolio Summary */}
                <div className="grid gap-4 md:grid-cols-3" data-tutorial-id="portfolio-stats-summary">
                  <Card data-tutorial-id="portfolio-value-stat">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Portfolio Value
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
                      <p className="text-xs text-muted-foreground">
                        Total value of your holdings
                      </p>
                    </CardContent>
                  </Card>
                  <Card data-tutorial-id="portfolio-performance-stat">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Unrealized P/L
                      </CardTitle>
                      {unrealizedPL >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(unrealizedPL)}</div>
                      <p className="text-xs text-muted-foreground">
                        {percentageReturn.toFixed(1)}% return
                      </p>
                    </CardContent>
                  </Card>
                  <Card data-tutorial-id="portfolio-holdings-count-stat">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Number of Holdings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{holdings.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Unique coins owned
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Holdings List */}
                <Card className="mt-8" data-tutorial-id="portfolio-coin-list-section">
                  <CardHeader>
                    <CardTitle>Your Holdings</CardTitle>
                    <CardDescription>
                      A detailed breakdown of your coin shares
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                            className="w-full p-0 h-auto hover:bg-accent"
                            onClick={() => router.push(`/coin/${holding.coinId}`)}
                          >
                            <div className="flex items-center space-x-4 w-full rounded-lg border p-4">
                              <Avatar className="h-16 w-24 rounded-lg">
                                <AvatarImage src={coin.image} alt={coin.name} className="object-cover" />
                                <AvatarFallback className="rounded-lg">{coin.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1 text-left">
                                <p className="font-medium leading-none">{coin.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {holding.shares} shares @ {formatCurrency(holding.purchasePrice)}/share
                                </p>
                                {holding.desiredSellPrice && (
                                  <p className="text-sm text-amber-400">
                                    Sell target: {formatCurrency(holding.desiredSellPrice)}/share
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(currentValue)}</p>
                                <p className={`text-sm ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
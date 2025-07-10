'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/layout/header';
import { Sidebar } from '@/components/shared/layout/sidebar';
import { CoinCard } from '@/components/shared/marketplace/coin-card';
import { coins } from '@/lib/data/coins';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';
import { useAuth } from '@/lib/context/auth-context';
import { usePortfolio } from '@/lib/context/portfolio-context';
import { useFinancial } from '@/lib/context/financial-context';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function calculatePercentageChange(current: number, original: number) {
  return ((current - original) / original) * 100;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { state, dispatch, currentStep } = useTutorial();
  const { isAuthenticated, user, setShowLoginDialog } = useAuth();
  const { getPortfolioValue, getUnrealizedPL } = usePortfolio();
  const { availableBalance } = useFinancial();

  const portfolioValue = getPortfolioValue();
  const unrealizedPL = getUnrealizedPL();
  const percentageReturn = calculatePercentageChange(
    portfolioValue,
    portfolioValue - unrealizedPL
  );



  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <div className="pt-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
              {/* Portfolio Section for Mobile */}
              <div className="lg:hidden mb-4 sm:mb-6">
                {isAuthenticated && user ? (
                  <div 
                    className="bg-zinc-900/50 rounded-lg p-4 border border-amber-600/30 cursor-pointer hover:bg-zinc-900/70 transition-colors relative"
                    data-tutorial-id="mobile-portfolio-widget"
                    onClick={() => {
                      console.log('Mobile portfolio widget clicked, navigating to portfolio');
                      router.push('/portfolio');
                    }}
                    style={{ 
                      // Ensure proper positioning for tutorial highlighting
                      position: 'relative',
                      zIndex: 1 
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-amber-600/20 p-2 rounded-full">
                          <TrendingUp className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-amber-400">
                            {formatCurrency(portfolioValue)}
                          </div>
                          <div className="text-xs text-muted-foreground">Portfolio Value</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${percentageReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {percentageReturn >= 0 ? '↑' : '↓'} {Math.abs(percentageReturn).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(availableBalance)} available
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 rounded-lg p-4 border border-amber-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-amber-600/20 p-2 rounded-full">
                          <Wallet className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-amber-400">
                            Login to View Portfolio
                          </div>
                          <div className="text-xs text-muted-foreground">Track your investments</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowLoginDialog(true)}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
                        data-tutorial-id="marketplace-portfolio-login-button"
                      >
                        Login
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky top-16 bg-background z-[var(--z-sticky-content)] py-2 sm:py-4 mb-4 sm:mb-8" data-marketplace-header>
                <h1 className="text-xl sm:text-4xl font-bold text-amber-400 mb-3 sm:mb-4">Marketplace</h1>
                
                {/* Hide filters on mobile, show on desktop and up */}
                <div className="hidden lg:flex flex-col lg:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
                  <Select disabled>
                    <SelectTrigger className="w-[180px] bg-zinc-900 text-amber-400/50 border-amber-600/30 cursor-not-allowed">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="us-coins">U.S. Coins</SelectItem>
                      <SelectItem value="world-coins">World Coins</SelectItem>
                      <SelectItem value="ancient-coins">Ancient Coins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select disabled>
                    <SelectTrigger className="w-[180px] bg-zinc-900 text-amber-400/50 border-amber-600/30 cursor-not-allowed">
                      <SelectValue placeholder="Sort by: Popular" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Sort by: Popular</SelectItem>
                      <SelectItem value="low-to-high">Price: Low to High</SelectItem>
                      <SelectItem value="high-to-low">Price: High to Low</SelectItem>
                      <SelectItem value="recent">Recently Added</SelectItem>
                      <SelectItem value="funded">Most Funded</SelectItem>
                      <SelectItem value="performing">Best Performing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center">
                <div data-tutorial-id="marketplace-coin-list-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-sm sm:max-w-none">
                {coins.map((coin) => (
                  <CoinCard key={coin.id} {...coin} />
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
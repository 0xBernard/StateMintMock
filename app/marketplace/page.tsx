'use client';

import { useEffect } from 'react';
import { Header } from '@/components/shared/layout/header';
import { Sidebar } from '@/components/shared/layout/sidebar';
import { CoinCard } from '@/components/shared/marketplace/coin-card';
import { coins } from '@/lib/data/coins';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';

export default function MarketplacePage() {
  const { state, dispatch, currentStep } = useTutorial();

  // Auto-advance tutorial if we're on marketplace-navigation step and already on marketplace page
  useEffect(() => {
    if (state.isActive && currentStep?.id === 'marketplace-navigation') {
      console.log('Marketplace page loaded while on marketplace-navigation step - auto-advancing');
      // Small delay to ensure the step is fully initialized
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }
  }, [state.isActive, currentStep?.id, dispatch]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <div className="pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="sticky top-16 bg-background z-[var(--z-sticky-content)] py-4 flex justify-between items-center mb-8" data-marketplace-header>
                <h1 className="text-4xl font-bold text-amber-400">Marketplace</h1>
                <div className="flex gap-4">
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

              <div data-tutorial-id="marketplace-coin-list-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coins.map((coin) => (
                  <CoinCard key={coin.id} {...coin} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
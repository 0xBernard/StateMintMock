'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { coins } from '@/lib/data/coins';
import { CoinDetail } from '@/components/shared/coin/coin-detail';
import { Header } from '@/components/shared/layout/header';
import { Sidebar } from '@/components/shared/layout/sidebar';
import { useTutorial } from '@/lib/tutorial/ephemeral-provider';

export default function CoinPage() {
  const params = useParams();
  const coin = coins.find(c => c.id === params.id);
  const { state, dispatch, currentStep } = useTutorial();

  // Auto-advance tutorial if we're on coin-selection-prompt step and already on coin detail page
  useEffect(() => {
    if (state.isActive && currentStep?.id === 'coin-selection-prompt') {
      console.log('Coin detail page loaded while on coin-selection-prompt step - auto-advancing');
      // Small delay to ensure the step is fully initialized
      setTimeout(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, 500);
    }
  }, [state.isActive, currentStep?.id, dispatch]);

  if (!coin) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <div className="pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-tutorial-id="coin-detail-page-container">
              <CoinDetail coin={coin} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
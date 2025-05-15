'use client';

import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { coins } from '@/lib/data/coins';
import { CoinDetail } from '@/components/shared/coin/coin-detail';
import { Header } from '@/components/shared/layout/header';
import { Sidebar } from '@/components/shared/layout/sidebar';

export default function CoinPage() {
  const params = useParams();
  const coin = coins.find(c => c.id === params.id);

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <CoinDetail coin={coin} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
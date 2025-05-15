import { Header } from '@/components/shared/layout/header';
import { Sidebar } from '@/components/shared/layout/sidebar';
import { CoinCard } from '@/components/shared/marketplace/coin-card';
import { coins } from '@/lib/data/coins';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <div className="pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex justify-between items-center mb-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoinData } from '@/lib/data/coins';
import { calculateMarketMetrics, formatSharePrice, formatPriceChange } from '@/lib/data/market';

type CoinCardProps = CoinData;

export function CoinCard({
  id,
  name,
  description,
  image,
  market,
  totalShares,
  soldShares,
  owners,
  rarity,
}: CoinCardProps) {
  const router = useRouter();
  const soldPercentage = (soldShares / totalShares) * 100;
  const metrics = calculateMarketMetrics(market);

  const rarityColors = {
    scarce: 'bg-zinc-800 text-zinc-200',
    rare: 'bg-blue-900 text-blue-200',
    legendary: 'bg-amber-900 text-amber-200'
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/coin/${id}`);
  };

  return (
    <Card 
      className="overflow-hidden bg-card border-border hover:border-amber-600/50 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[2/1] bg-black">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold uppercase ${rarityColors[rarity]}`}>
          {rarity}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-amber-400 mb-1 truncate" title={name}>
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2" title={description}>
          {description}
        </p>

        <div className="space-y-3">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-amber-400/80">{soldPercentage.toFixed(1)}% funded</span>
            <span className="text-amber-400/80">{owners} investors</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-baseline">
            <div className="text-sm text-muted-foreground">Current Price:</div>
            <div className="text-lg font-bold text-amber-400">
              {metrics.lowestAsk !== null ? formatSharePrice(metrics.lowestAsk) : formatSharePrice(market.currentMarketPrice)}
            </div>
          </div>
          <div className="flex justify-between items-baseline">
            <div className="text-sm text-muted-foreground">Initial Price:</div>
            <div className="text-sm text-amber-400/60">{formatSharePrice(market.initialSharePrice)}</div>
          </div>
          {metrics.priceIncrease > 0 && (
            <div className="flex justify-end text-sm text-green-500">
              {formatPriceChange(metrics.priceIncrease)}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm text-amber-400/60">
          {metrics.availableShares} shares available
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-600/30 hover:border-amber-500 hover:bg-amber-950/50 text-amber-400"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/coin/${id}`);
            }}
          >
            Details
          </Button>
          <Button 
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/coin/${id}?action=buy`);
            }}
          >
            Invest
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoinData } from '@/lib/data/coins';
import { calculateMarketMetrics, formatSharePrice, formatPriceChange } from '@/lib/data/market';

type CoinCardProps = CoinData & {
  priority?: boolean; // For above-the-fold loading
  index?: number;     // For determining loading priority
};

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
  priority = false,
  index = 0,
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
      className="coin-card overflow-hidden bg-card border-border hover:border-amber-600/50 transition-colors cursor-pointer p-0"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[2/1] bg-black rounded-t-lg overflow-hidden">
        <Image
          src={image}
          alt={`${name} collectible coin`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority || index < 4} // Prioritize first 4 images
          loading={priority || index < 4 ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyatNeaSmCGGmclSCtjfJeciVgI6iqOYdvdKyMIpwGFLKOYoJEMLhN/fgA1A8jqCrLhcOwrGKE8nVFSM8nQHHNiNj/eH9uVGqjCeFLpLZGAGGFcU1Xzyl4MXJqM8IhFgPsE/wOJjWZDd3KdKyMTNvQvE2adKLGKE8nVHPnXL2aVg5K1C8T2sKdWbvqnmTaZEUgVNJlnlJKnkrUJbMfccfaYo4/8VAP1Qz8wm9jHdAHxj6zU"
          onLoad={(e) => {
            // Fade in effect after load
            e.currentTarget.style.opacity = '1';
          }}
          onError={(e) => {
            // Fallback for broken images
            e.currentTarget.src = '/images/coin-placeholder.jpg';
          }}
        />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold uppercase ${rarityColors[rarity]}`}>
          {rarity}
        </div>
      </div>

      <CardContent className="p-1.5 sm:p-4">
        <h3 className="text-sm sm:text-lg font-semibold text-amber-400 mb-0.5 sm:mb-1 truncate" title={name}>
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-4 line-clamp-1 sm:line-clamp-2" title={description}>
          {description}
        </p>

        <div className="space-y-1.5 sm:space-y-3">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${soldPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-amber-400/80">{soldPercentage.toFixed(1)}% funded</span>
            <span className="text-amber-400/80">{owners} investors</span>
          </div>
        </div>

        <div className="mt-1.5 sm:mt-4 space-y-0.5 sm:space-y-2">
          <div className="flex justify-between items-baseline">
            <div className="text-xs sm:text-sm text-muted-foreground">Current Price:</div>
            <div className="text-base sm:text-lg font-bold text-amber-400">
              {metrics.lowestAsk !== null ? formatSharePrice(metrics.lowestAsk) : formatSharePrice(market.currentMarketPrice)}
            </div>
          </div>
          <div className="flex justify-between items-baseline">
            <div className="text-xs sm:text-sm text-muted-foreground">Initial Price:</div>
            <div className="text-xs sm:text-sm text-amber-400/60">{formatSharePrice(market.initialSharePrice)}</div>
          </div>
          {metrics.priceIncrease > 0 && (
            <div className="flex justify-end text-xs sm:text-sm text-green-500">
              {formatPriceChange(metrics.priceIncrease)}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-1.5 sm:p-4 pt-0 flex justify-between items-center">
        <div className="text-xs text-amber-400/60">
          {metrics.availableShares} shares available
        </div>
        <Button 
          size="sm"
          className="bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs sm:text-sm px-4 sm:px-6 h-8 sm:h-auto"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/coin/${id}?action=buy`);
          }}
        >
          Invest
        </Button>
      </CardFooter>
    </Card>
  );
} 
'use client';

import { create } from 'zustand';
import { coins } from '@/lib/data/coins';
import { getMemoryItem, setMemoryItem } from './memory-store';

export interface ShareHolding {
  coinId: string;
  shares: number;
  purchasePrice: number;
  desiredSellPrice: number | null;
}

interface PortfolioState {
  holdings: ShareHolding[];
  getPortfolioValue: () => number;
  getUnrealizedPL: () => number;
  addShares: (coinId: string, shares: number, purchasePrice: number, desiredSellPrice: number | null) => void;
  removeShares: (coinId: string, shares: number) => boolean;
  updateDesiredSellPrice: (coinId: string, desiredSellPrice: number | null) => void;
}

// Initial demo holdings - about $12,000 total value
const initialHoldings: ShareHolding[] = [
  {
    coinId: '1909-s-vdb-lincoln-cent',
    shares: 20,          // ~$3,300 value (165 * 20)
    purchasePrice: 150,
    desiredSellPrice: 200,
  },
  {
    coinId: '1916-d-mercury-dime',
    shares: 15,          // ~$3,300 value (220 * 15)
    purchasePrice: 220,
    desiredSellPrice: 300,
  },
  {
    coinId: '1879-seated-liberty-quarter',
    shares: 25,          // ~$3,125 value (125 * 25)
    purchasePrice: 110,
    desiredSellPrice: 150,
  },
  {
    coinId: '1841-seated-liberty-half-dime',
    shares: 50,          // ~$3,125 value (62.50 * 50)
    purchasePrice: 55,
    desiredSellPrice: 75,
  }
];

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  holdings: getMemoryItem<ShareHolding[]>('portfolioHoldings') ?? initialHoldings,
  getPortfolioValue: () => {
    return get().holdings.reduce((total, holding) => {
      const coin = coins.find(c => c.id === holding.coinId);
      if (!coin) return total;
      return total + (coin.market.currentMarketPrice * holding.shares);
    }, 0);
  },
  getUnrealizedPL: () => {
    return get().holdings.reduce((total, holding) => {
      const coin = coins.find(c => c.id === holding.coinId);
      if (!coin) return total;
      const currentValue = coin.market.currentMarketPrice * holding.shares;
      const costBasis = holding.purchasePrice * holding.shares;
      return total + (currentValue - costBasis);
    }, 0);
  },
  addShares: (coinId: string, shares: number, purchasePrice: number, desiredSellPrice: number | null) => {
    set(state => {
      const existingHolding = state.holdings.find(h => h.coinId === coinId);
      let newHoldings: ShareHolding[];

      if (existingHolding) {
        // Calculate weighted average purchase price
        const totalShares = existingHolding.shares + shares;
        const weightedPrice = (
          (existingHolding.shares * existingHolding.purchasePrice) +
          (shares * purchasePrice)
        ) / totalShares;

        newHoldings = state.holdings.map(h => 
          h.coinId === coinId
            ? {
                ...h,
                shares: totalShares,
                purchasePrice: Number(weightedPrice.toFixed(2)), // Round to 2 decimal places
                desiredSellPrice: desiredSellPrice ?? h.desiredSellPrice
              }
            : h
        );
      } else {
        newHoldings = [...state.holdings, {
          coinId,
          shares,
          purchasePrice: Number(purchasePrice.toFixed(2)), // Round to 2 decimal places
          desiredSellPrice
        }];
      }

      setMemoryItem('portfolioHoldings', newHoldings);
      return { holdings: newHoldings };
    });
  },
  removeShares: (coinId: string, shares: number) => {
    const state = get();
    const holding = state.holdings.find(h => h.coinId === coinId);
    if (!holding || holding.shares < shares) return false;

    set(state => {
      let newHoldings: ShareHolding[];
      
      if (holding.shares === shares) {
        newHoldings = state.holdings.filter(h => h.coinId !== coinId);
      } else {
        newHoldings = state.holdings.map(h =>
          h.coinId === coinId
            ? { ...h, shares: h.shares - shares }
            : h
        );
      }

      setMemoryItem('portfolioHoldings', newHoldings);
      return { holdings: newHoldings };
    });

    return true;
  },
  updateDesiredSellPrice: (coinId: string, desiredSellPrice: number | null) => {
    set(state => {
      const newHoldings = state.holdings.map(h =>
        h.coinId === coinId
          ? { ...h, desiredSellPrice }
          : h
      );
      setMemoryItem('portfolioHoldings', newHoldings);
      return { holdings: newHoldings };
    });
  }
})); 
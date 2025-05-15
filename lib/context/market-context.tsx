'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { coins, CoinData } from '@/lib/data/coins';
import { getMemoryItem, setMemoryItem } from '@/lib/store/memory-store';
import { ShareListing } from '@/lib/data/market';
import { safeMultiply } from '@/lib/utils/number-formatting';

interface MarketState {
  [coinId: string]: {
    availableShares: ShareListing[];
    userListings: ShareListing[];
  };
}

interface MarketContextType {
  getAvailableShares: (coinId: string) => ShareListing[];
  addUserListing: (coinId: string, price: number, quantity: number) => void;
  purchaseShares: (coinId: string, quantity: number, maxPrice: number) => {
    success: boolean;
    breakdown: { price: number; quantity: number; subtotal: number }[];
    totalCost: number;
    averagePrice: number;
  } | null;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Initialize market state from coins data
function initializeMarketState(): MarketState {
  const initialState: MarketState = {};
  
  coins.forEach(coin => {
    // Ensure all share listings have required boolean flags
    const availableShares: ShareListing[] = coin.market.availableShares.map(share => ({
      price: share.price,
      quantity: share.quantity,
      isUserListing: Boolean(share.isUserListing),
      isOriginalShares: Boolean(share.isOriginalShares)
    }));

    // Filter out user listings to maintain them separately
    const userListings: ShareListing[] = availableShares
      .filter(share => share.isUserListing)
      .map(share => ({ ...share }));

    initialState[coin.id] = {
      availableShares,
      userListings
    };
  });

  return initialState;
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [marketState, setMarketState] = useState<MarketState>(() => {
    const stored = getMemoryItem<MarketState>('marketState');
    return stored ?? initializeMarketState();
  });

  // Save state to memory store whenever it changes
  useEffect(() => {
    setMemoryItem('marketState', marketState);
  }, [marketState]);

  const getAvailableShares = (coinId: string) => {
    return marketState[coinId]?.availableShares || [];
  };

  const addUserListing = (coinId: string, price: number, quantity: number) => {
    setMarketState(prev => {
      const newState = { ...prev };
      if (!newState[coinId]) {
        newState[coinId] = { availableShares: [], userListings: [] };
      }

      // Create the new listing
      const newListing: ShareListing = {
        price,
        quantity,
        isUserListing: true,
        isOriginalShares: false
      };

      // Remove any existing user listings at this price
      newState[coinId].availableShares = newState[coinId].availableShares.filter(
        share => !(share.isUserListing && share.price === price)
      );

      // Remove from user listings at this price
      newState[coinId].userListings = newState[coinId].userListings.filter(
        listing => listing.price !== price
      );

      // Add new listing to both arrays
      newState[coinId].availableShares = [
        ...newState[coinId].availableShares,
        newListing
      ].sort((a, b) => a.price - b.price);

      newState[coinId].userListings = [
        ...newState[coinId].userListings,
        newListing
      ];

      return newState;
    });
  };

  const purchaseShares = (coinId: string, quantity: number, maxPrice: number) => {
    const availableShares = getAvailableShares(coinId);
    if (!availableShares.length) return null;

    let remainingQuantity = quantity;
    const breakdown: { price: number; quantity: number; subtotal: number }[] = [];
    let totalCost = 0;

    // Sort by price ascending to get best prices first
    const sortedShares = [...availableShares].sort((a, b) => a.price - b.price);
    const sharesToUpdate: { index: number; newQuantity: number }[] = [];

    for (let i = 0; i < sortedShares.length; i++) {
      const listing = sortedShares[i];
      if (listing.price > maxPrice) continue;
      if (remainingQuantity <= 0) break;

      const purchaseQuantity = Math.min(remainingQuantity, listing.quantity);
      const subtotal = safeMultiply(purchaseQuantity, listing.price);
      
      breakdown.push({
        price: listing.price,
        quantity: purchaseQuantity,
        subtotal
      });
      
      totalCost += subtotal;
      remainingQuantity -= purchaseQuantity;
      
      // Track the updates needed
      const originalIndex = availableShares.findIndex(
        share => share.price === listing.price && share.quantity === listing.quantity
      );
      if (originalIndex !== -1) {
        sharesToUpdate.push({
          index: originalIndex,
          newQuantity: listing.quantity - purchaseQuantity
        });
      }
    }

    if (remainingQuantity > 0) return null;

    // Update available shares
    setMarketState(prev => {
      const newState = { ...prev };
      const newAvailableShares = [...newState[coinId].availableShares];
      
      // Apply all updates
      for (const update of sharesToUpdate) {
        if (update.newQuantity <= 0) {
          // Remove the listing if no shares left
          newAvailableShares.splice(update.index, 1);
        } else {
          // Update the quantity
          newAvailableShares[update.index] = {
            ...newAvailableShares[update.index],
            quantity: update.newQuantity
          };
        }
      }
      
      newState[coinId].availableShares = newAvailableShares;
      return newState;
    });

    const averagePrice = totalCost / quantity;
    return { success: true, breakdown, totalCost, averagePrice };
  };

  return (
    <MarketContext.Provider value={{
      getAvailableShares,
      addUserListing,
      purchaseShares
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
} 
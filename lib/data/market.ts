import { safeMultiply } from '@/lib/utils/number-formatting';

export interface ShareListing {
  price: number;
  quantity: number;
  isOriginalShares?: boolean;
  isUserListing?: boolean;
}

export interface MarketData {
  initialSharePrice: number;
  currentMarketPrice: number;
  availableShares: ShareListing[];
}

export interface PurchaseBreakdown {
  totalShares: number;
  totalCost: number;
  averagePrice: number;
  breakdown: {
    price: number;
    quantity: number;
    subtotal: number;
    isOriginalShares: boolean;
  }[];
}

export function calculatePurchaseBreakdown(availableShares: ShareListing[], desiredQuantity: number): PurchaseBreakdown | null {
  if (!Array.isArray(availableShares) || availableShares.length === 0 || !desiredQuantity || desiredQuantity <= 0) {
    console.error('Invalid inputs to calculatePurchaseBreakdown:', { availableShares, desiredQuantity });
    return null;
  }

  // Sort by price ascending to get best prices first
  const sortedShares = [...availableShares]
    .sort((a, b) => a.price - b.price)
    .filter(listing => listing.quantity > 0 && listing.price > 0); // Ensure valid listings only

  let remainingQuantity = desiredQuantity;
  let totalCost = 0;
  const breakdown: PurchaseBreakdown['breakdown'] = [];

  // Track how many shares we can actually fulfill
  let totalAvailableShares = sortedShares.reduce((sum, listing) => sum + listing.quantity, 0);
  if (totalAvailableShares < desiredQuantity) {
    console.error('Not enough shares available:', { totalAvailableShares, desiredQuantity });
    return null;
  }

  for (const listing of sortedShares) {
    if (remainingQuantity <= 0) break;

    const purchaseQuantity = Math.min(remainingQuantity, listing.quantity);
    const price = Number(listing.price);
    const subtotal = safeMultiply(purchaseQuantity, price);
    
    if (subtotal <= 0) {
      console.error('Invalid calculation in breakdown:', { purchaseQuantity, price, subtotal });
      continue;
    }

    breakdown.push({
      price: price,
      quantity: purchaseQuantity,
      subtotal: subtotal,
      isOriginalShares: !!listing.isOriginalShares
    });

    totalCost += subtotal;
    remainingQuantity -= purchaseQuantity;
  }

  // If we couldn't fulfill the entire order, return null
  if (remainingQuantity > 0 || breakdown.length === 0) {
    console.error('Could not fulfill entire order:', { remainingQuantity, breakdownLength: breakdown.length });
    return null;
  }

  const totalShares = desiredQuantity;
  const averagePrice = totalCost / totalShares;

  // Validate final calculations
  if (isNaN(averagePrice) || averagePrice <= 0) {
    console.error('Invalid average price calculation:', { totalCost, totalShares, averagePrice });
    return null;
  }

  return {
    totalShares,
    totalCost,
    averagePrice,
    breakdown
  };
}

export function calculateMarketMetrics(market: MarketData) {
  if (!market.availableShares.length) {
    return {
      lowestAsk: null,
      availableShares: 0,
      priceIncrease: 0
    };
  }

  const lowestAsk = market.availableShares.reduce(
    (min, ask) => ask.price < min ? ask.price : min,
    market.availableShares[0].price
  );

  const totalAvailable = market.availableShares.reduce(
    (sum, ask) => sum + ask.quantity,
    0
  );

  const priceIncrease = ((lowestAsk - market.initialSharePrice) / market.initialSharePrice) * 100;

  return {
    lowestAsk,
    availableShares: totalAvailable,
    priceIncrease
  };
}

export function formatSharePrice(price: number | null): string {
  if (price === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceChange(percentage: number) {
  return `+${percentage.toFixed(1)}%`;
} 
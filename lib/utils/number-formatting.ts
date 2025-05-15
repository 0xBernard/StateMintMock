/**
 * Utility functions for safe number formatting
 */

/**
 * Safely formats a number to a string with the specified number of decimal places
 */
export function formatNumber(value: number | string | undefined | null, decimals: number = 2): string {
  // Convert string to number if needed
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid values
  if (typeof num !== 'number' || isNaN(num)) {
    return '0.00';
  }

  // Format with fixed decimals
  return num.toFixed(decimals);
}

/**
 * Safely formats a number as currency
 */
export function formatCurrency(value: number | string | undefined | null): string {
  return `$${formatNumber(value)}`;
}

/**
 * Safely multiplies two numbers, handling string conversion and invalid values
 */
export function safeMultiply(a: number | string | undefined | null, b: number | string | undefined | null): number {
  const numA = typeof a === 'string' ? parseFloat(a) : (typeof a === 'number' ? a : 0);
  const numB = typeof b === 'string' ? parseFloat(b) : (typeof b === 'number' ? b : 0);
  return isNaN(numA) || isNaN(numB) ? 0 : numA * numB;
}

/**
 * Safely formats a percentage
 */
export function formatPercentage(value: number | string | undefined | null, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Safely calculates percentage change between two values
 */
export function calculatePercentageChange(current: number | string | undefined | null, previous: number | string | undefined | null): number {
  const currentNum = typeof current === 'string' ? parseFloat(current) : (typeof current === 'number' ? current : 0);
  const previousNum = typeof previous === 'string' ? parseFloat(previous) : (typeof previous === 'number' ? previous : 0);
  
  if (isNaN(currentNum) || isNaN(previousNum) || previousNum === 0) {
    return 0;
  }
  
  return ((currentNum - previousNum) / previousNum) * 100;
} 
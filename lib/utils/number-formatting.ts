/**
 * Utility functions for safe number formatting
 */

/**
 * Safely formats a number to a string with the specified number of decimal places and thousand separators
 */
export function formatNumber(value: number | string | undefined | null, decimals: number = 2): string {
  // Convert string to number if needed
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid values
  if (typeof num !== 'number' || isNaN(num)) {
    return decimals === 0 ? '0' : '0.00';
  }

  // Use Intl.NumberFormat for proper number formatting with commas
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Safely formats a number as currency with proper thousand separators
 */
export function formatCurrency(value: number | string | undefined | null): string {
  // Convert string to number if needed
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid values
  if (typeof num !== 'number' || isNaN(num)) {
    return '$0.00';
  }

  // Use Intl.NumberFormat for proper currency formatting with commas
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
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
 * Formats a number with commas but no currency symbol (useful for share counts, etc.)
 */
export function formatNumberWithCommas(value: number | string | undefined | null): string {
  // Convert string to number if needed
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid values
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }

  // Use Intl.NumberFormat for comma formatting without decimals
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Parse a string that may contain commas and return a number
 */
export function parseNumberWithCommas(value: string): number {
  if (!value || typeof value !== 'string') return NaN;
  // Remove commas and parse
  const cleanValue = value.replace(/,/g, '');
  return parseFloat(cleanValue);
}

/**
 * Format a number input value with commas as the user types
 */
export function formatNumberInput(value: string): string {
  if (!value) return '';
  
  // Remove all non-digit, non-decimal, non-comma characters
  let cleaned = value.replace(/[^\d.,]/g, '');
  
  // Remove commas temporarily for processing
  cleaned = cleaned.replace(/,/g, '');
  
  // Handle multiple decimal points - keep only the first one
  const decimalIndex = cleaned.indexOf('.');
  if (decimalIndex !== -1) {
    cleaned = cleaned.slice(0, decimalIndex + 1) + cleaned.slice(decimalIndex + 1).replace(/\./g, '');
  }
  
  // Split into integer and decimal parts
  const parts = cleaned.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Combine parts
  if (decimalPart !== undefined) {
    return formattedInteger + '.' + decimalPart;
  } else {
    return formattedInteger;
  }
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
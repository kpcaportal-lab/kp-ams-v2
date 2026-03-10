import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes with clsx logic.
 * Essential for premium components to handle dynamic styling safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Indian currency format (Lakhs, Crores).
 */
export function formatIndianCurrency(amount: number, includeSymbol = true, short = false) {
  if (short) {
    if (amount >= 10000000) {
      return `${includeSymbol ? '₹' : ''}${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `${includeSymbol ? '₹' : ''}${(amount / 100000).toFixed(2)} L`;
    }
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

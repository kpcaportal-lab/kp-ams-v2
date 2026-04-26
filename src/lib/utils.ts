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
export function formatIndianCurrency(amount: number | string, includeSymbol = true, _short = false) {
  const numAmount = Number(amount || 0);
  // User requested exact amounts, so we ignore the 'short' flag
  /*
  if (short) {
    if (numAmount >= 10000000) {
      return `${includeSymbol ? '₹' : ''}${(numAmount / 10000000).toFixed(2)} Cr`;
    }
    if (numAmount >= 100000) {
      return `${includeSymbol ? '₹' : ''}${(numAmount / 100000).toFixed(2)} L`;
    }
  }
  */

  const formatter = new Intl.NumberFormat('en-IN', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  return formatter.format(numAmount);
}

/**
 * Specialized INR formatter with suffix (K, L, Cr)
 */
export function formatINR(amount: number) {
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Safely extracts a string error message from various error types,
 * especially handling Axios errors and nested object responses from the backend.
 */
export function getErrorMessage(err: any): string {
  if (!err) return 'An unknown error occurred';
  
  // Handle string errors
  if (typeof err === 'string') return err;
  
  // Handle Axios response errors
  if (err.response?.data) {
    const data = err.response.data;
    
    // Check for nested error object (e.g., { error: { message: "...", code: "...", details: [...] } })
    if (data.error && typeof data.error === 'object') {
      const e = data.error;
      // If there are specific validation details, join them
      if (Array.isArray(e.details) && e.details.length > 0) {
        return e.details.map((d: any) => {
          if (typeof d === 'object') {
            return d.field ? `${d.field}: ${d.message || 'Invalid value'}` : (d.message || 'Invalid value');
          }
          return String(d);
        }).join(', ');
      }
      return e.message || (typeof e.details === 'string' ? e.details : JSON.stringify(e));
    }
    
    // Check for direct fields
    if (Array.isArray(data.details) && data.details.length > 0) {
      return data.details.map((d: any) => {
        if (typeof d === 'object') {
          return d.field ? `${d.field}: ${d.message || d.msg || 'Invalid value'}` : (d.message || d.msg || 'Invalid value');
        }
        return String(d);
      }).join(', ');
    }

    const errVal = data.error || data.message;
    if (typeof errVal === 'string') return errVal;
    if (data.details) {
      return typeof data.details === 'string' ? data.details : JSON.stringify(data.details);
    }
    return typeof data === 'string' ? data : 'Server error';
  }
  
  // Handle standard Error objects
  if (err instanceof Error) return err.message;
  
  // Handle other object types
  if (err.message) return err.message;
  
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

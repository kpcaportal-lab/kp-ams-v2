import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ValidationDetail {
  field?: string;
  message?: string;
  msg?: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      error?: {
        message?: string;
        details?: unknown[] | string;
      };
      message?: string;
      details?: unknown[] | string;
    };
  };
  message?: string;
}

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatIndianCurrency(amount: number | string, includeSymbol = true, _short = false) {
  const numAmount = Number(amount || 0);
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
export function getErrorMessage(err: ErrorResponse | string | unknown): string {
  if (!err) return 'An unknown error occurred';
  
  // Handle string errors
  if (typeof err === 'string') return err;
  
  // Handle Axios response errors
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const responseErr = err as ErrorResponse;
    if (responseErr.response?.data) {
      const data = responseErr.response.data;
      
      // Check for nested error object (e.g., { error: { message: "...", code: "...", details: [...] } })
      if (data.error && typeof data.error === 'object') {
        const e = data.error as { message?: string; details?: unknown[] | string };
        // If there are specific validation details, join them
        if (Array.isArray(e.details) && e.details.length > 0) {
          return e.details.map((d) => {
            if (typeof d === 'object' && d !== null) {
              const detail = d as ValidationDetail;
              return detail.field ? `${detail.field}: ${detail.message || 'Invalid value'}` : (detail.message || 'Invalid value');
            }
            return String(d);
          }).join(', ');
        }
        return e.message || (typeof e.details === 'string' ? e.details : JSON.stringify(e));
      }
      
      // Check for direct fields
      if (Array.isArray(data.details) && data.details.length > 0) {
        return data.details.map((d) => {
          if (typeof d === 'object' && d !== null) {
            const detail = d as ValidationDetail;
            return detail.field ? `${detail.field}: ${detail.message || detail.msg || 'Invalid value'}` : (detail.message || detail.msg || 'Invalid value');
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
  }
  
  // Handle standard Error objects
  if (err instanceof Error) return err.message;
  
  // Handle other object types
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String(err.message);
  }
  
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Wrapper around Next.js router.push for consistent navigation.
 * Usage: const navigate = useNavigate(); navigate('/dashboard');
 */
export function useNavigate() {
  const router = useRouter();
  return useCallback((path: string) => router.push(path), [router]);
}

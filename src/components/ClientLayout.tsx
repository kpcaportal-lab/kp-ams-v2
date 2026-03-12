"use client";
import React from 'react';
import { useLoading } from '@/components/LoadingProvider';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useLoading();
  return (
    <>
      {loading && <LoadingOverlay message="Loading..." />}
      {children}
    </>
  );
}

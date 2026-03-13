"use client";
import React from 'react';
import { useLoading } from '@/components/LoadingProvider';
import { useLoadingStore } from '@/store/loadingStore';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { loading: contextLoading } = useLoading();
  const { startLoading, stopLoading } = useLoadingStore();

  // Sync context loading to store loading for unified overlay
  React.useEffect(() => {
    if (contextLoading) startLoading();
    else stopLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextLoading]);

  return (
    <>
      <LoadingOverlay />
      {children}
    </>
  );
}

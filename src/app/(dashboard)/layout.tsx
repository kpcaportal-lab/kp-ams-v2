'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simple client-side catch-all, though middleware handles the real protection
  useEffect(() => {
    if (isClient && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isClient, isAuthenticated, isLoading, router]);

  if (!isClient || isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--bg-card)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-main)', overflow: 'hidden', position: 'relative' }}>
      <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

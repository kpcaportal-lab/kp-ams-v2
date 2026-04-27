'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function BrandedLogo({ 
  variant = 'full', 
  theme = 'light',
  className = '' 
}: { 
  variant?: 'full' | 'monogram'; 
  theme?: 'light' | 'dark';
  className?: string;
}) {
  const isDark = theme === 'dark';
  
  if (variant === 'monogram') {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-xl font-bold shadow-sm transition-all duration-300",
        isDark ? "bg-white/5 border border-white/10 text-white" : "bg-brand-navy text-white",
        className
      )} style={{ width: '40px', height: '40px', fontSize: '18px' }}>
        <span style={{ color: 'var(--brand-gold, #D4A574)' }}>K</span>
        <span style={{ color: '#fff' }}>&</span>
        <span style={{ color: 'var(--brand-gold, #D4A574)' }}>P</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-start leading-none tracking-tight", className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "text-2xl font-black uppercase font-sans",
          isDark ? "text-white" : "text-brand-navy"
        )}>
          Kirtane <span className="opacity-60">&</span> Pandit
        </span>
      </div>
      <span className={cn(
        "text-[9px] font-black tracking-[0.3em] uppercase opacity-80",
        isDark ? "text-brand-gold/90" : "text-brand-navy/70"
      )}>
        Chartered Accountants
      </span>
    </div>
  );
}

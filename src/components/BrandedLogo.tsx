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
        "flex items-center justify-center rounded-[1rem] font-black shadow-lg transition-all duration-500 group-hover:scale-110 border",
        isDark ? "bg-white/10 border-white/10 text-white" : "bg-brand-navy border-brand-navy/10 text-white",
        className
      )} style={{ width: '48px', height: '48px', fontSize: '20px', letterSpacing: '-0.05em' }}>
        <span className="text-white">K</span>
        <span className="mx-0.5 text-brand-red font-serif italic">&</span>
        <span className="text-white">P</span>
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
          Kirtane <span className="text-brand-red font-serif italic mx-0.5 lowercase">&</span> Pandit
        </span>
      </div>
      <span className={cn(
        "text-[9px] font-black tracking-[0.3em] uppercase opacity-80",
        isDark ? "text-white/70" : "text-brand-navy/70"
      )}>
        Chartered Accountants
      </span>
    </div>
  );
}



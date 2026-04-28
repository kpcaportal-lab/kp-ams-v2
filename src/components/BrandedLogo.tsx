'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function BrandedLogo({ 
  variant = 'full', 
  isDark = false,
  className = '' 
}: { 
  variant?: 'full' | 'monogram'; 
  isDark?: boolean;
  className?: string;
}) {
  if (variant === 'monogram') {
    return (
      <div className={cn(
        "flex items-center justify-center rounded-2xl font-black transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl relative overflow-hidden",
        isDark ? "bg-white/10 border border-white/20" : "bg-gradient-to-br from-brand-navy to-[#001540] border border-white/20",
        className
      )} style={{ width: '52px', height: '52px', fontSize: '22px', letterSpacing: '-0.05em' }}>
        {/* Gloss effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-40" />
        <div className="relative z-10 flex items-center">
          <span className="text-white drop-shadow-md">K</span>
          <span className="mx-0.5 text-brand-red font-serif italic drop-shadow-[0_0_8px_rgba(192,39,45,0.4)]">&</span>
          <span className="text-white drop-shadow-md">P</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-start leading-none tracking-tight", className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "text-2xl font-black uppercase font-sans tracking-tight",
          isDark ? "text-white" : "text-brand-navy"
        )}>
          Kirtane <span className="text-brand-red font-serif italic mx-0.5 lowercase drop-shadow-sm">&</span> Pandit
        </span>
      </div>
      <span className={cn(
        "text-[8px] font-black tracking-[0.4em] uppercase opacity-40 mt-1",
        isDark ? "text-white/70" : "text-brand-navy"
      )}>
        Chartered Accountants
      </span>
    </div>
  );
}



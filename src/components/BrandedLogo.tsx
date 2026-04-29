'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Inline K&P logotype — transparent background, works on any surface
function KPMark({ className, size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 120 80"
      width={size}
      height={size * (80 / 120)}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* K */}
      <text
        x="4"
        y="68"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
        fontSize="72"
        fill="#FFFFFF"
        letterSpacing="-2"
      >K</text>
      {/* & */}
      <text
        x="44"
        y="68"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
        fontSize="72"
        fill="#C8102E"
        letterSpacing="-2"
      >&amp;</text>
      {/* P */}
      <text
        x="82"
        y="68"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
        fontSize="72"
        fill="#FFFFFF"
        letterSpacing="-2"
      >P</text>
    </svg>
  );
}

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
        <span className="text-brand-gold">K</span>
        <span className="mx-0.5 text-white/40">&</span>
        <span className="text-brand-gold">P</span>
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

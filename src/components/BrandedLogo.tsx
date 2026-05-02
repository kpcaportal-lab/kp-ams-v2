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
  hideText = false,
  className = ''
}: {
  variant?: 'full' | 'monogram';
  theme?: 'light' | 'dark';
  hideText?: boolean;
  className?: string;
}) {
  const isDark = theme === 'dark';

  if (variant === 'monogram') {
    return (
      <div className={cn(
        "flex items-center justify-center transition-all duration-500",
        className
      )}>
        <KPMark size={56} />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <KPMark size={52} />
      {!hideText && (
        <div className="flex flex-col text-left">
          <span className={cn("font-extrabold text-sm leading-none tracking-tight", isDark ? "text-white" : "text-brand-navy")}>
            KIRTANE & PANDIT
          </span>
          <span className="text-[8px] font-extrabold text-brand-red uppercase tracking-[0.2em] mt-0.5">
            Management System
          </span>
        </div>
      )}
    </div>
  );
}


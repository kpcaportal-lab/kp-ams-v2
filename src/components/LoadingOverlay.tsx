"use client";
import React from 'react';
import { useLoadingStore } from '@/store/loadingStore';

export function LoadingOverlay() {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-navy/90 backdrop-blur-xl transition-all duration-500 animate-in fade-in"
    >
      <div className="relative flex flex-col items-center p-16 bg-brand-navy rounded-[40px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden group">
        {/* Animated background highlights */}
        <div className="absolute -inset-10 bg-gradient-to-br from-brand-gold/10 via-transparent to-brand-red/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-brand-gold/20 blur-3xl animate-pulse" />
            
            {/* Branded Circular Spinner */}
            <div className="relative w-24 h-24">
              {/* Static background ring */}
              <div className="absolute inset-0 border-[6px] border-white/5 rounded-full" />
              {/* Spinning branded ring */}
              <div className="absolute inset-0 border-[6px] border-transparent border-t-brand-gold border-r-brand-gold/40 rounded-full animate-spin shadow-[0_0_15px_var(--brand-gold)]" />
              {/* Pulsing center dot */}
              <div className="absolute inset-[38px] bg-brand-gold rounded-full animate-pulse shadow-[0_0_20px_var(--brand-gold)]" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl font-black text-white tracking-[0.3em] uppercase mb-1">
              Initializing
            </span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
          <p className="mt-6 text-brand-gold/60 text-[10px] font-black tracking-[0.2em] uppercase">
            KP Enterprise Systems Secured
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

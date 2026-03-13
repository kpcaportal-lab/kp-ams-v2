"use client";
import React from 'react';
import { useLoadingStore } from '@/store/loadingStore';

export function LoadingOverlay() {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-300 animate-in fade-in"
    >
      <div className="relative flex flex-col items-center p-8 bg-white/10 rounded-2xl border border-white/20 shadow-2xl overflow-hidden group">
        {/* Animated background highlights */}
        <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl group-hover:opacity-100 transition-opacity duration-1000 opacity-70"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-white/5 border-t-purple-400 animate-spin-slow"></div>
          </div>
          
          <span className="text-xl font-bold text-white tracking-widest uppercase">
            Processing
            <span className="inline-flex ml-1">
              <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
            </span>
          </span>
          <p className="mt-2 text-blue-200/80 text-sm font-medium tracking-wide">
            Syncing with KP Enterprise
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

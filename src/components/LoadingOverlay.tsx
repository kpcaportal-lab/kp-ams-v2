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
          <div className="relative w-32 h-32 mb-8 animate-float">
            <img 
              src="/images/loading_logo.png" 
              alt="Loading" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse-gentle" 
            />
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-white tracking-[0.3em] uppercase mb-1">
              Initializing
            </span>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
          <p className="mt-6 text-blue-200/60 text-[10px] font-black tracking-[0.2em] uppercase">
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

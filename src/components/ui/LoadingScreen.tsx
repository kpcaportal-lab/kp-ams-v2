"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  isLoading?: boolean;
  message?: string;
  submessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isLoading = true,
  message = "Loading Intelligence...", 
  submessage = "Synchronizing data with the neural core" 
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl"
        >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/30 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-primary-200 blur-2xl rounded-full opacity-20 scale-150 animate-pulse"></div>
        
        {/* Main Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="relative z-10 p-4 bg-white rounded-3xl shadow-2xl border border-slate-100"
        >
          <Loader2 className="w-12 h-12 text-primary-600" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-center px-6"
      >
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">{message}</h2>
        <p className="mt-2 text-slate-500 font-bold animate-pulse">{submessage}</p>
      </motion.div>

      {/* Progress Bar Placeholder for Premium Feel */}
      <div className="mt-8 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full bg-primary-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
);
};

export default LoadingScreen;

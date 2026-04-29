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
  message = "Processing Request...", 
  submessage = "Updating firm records" 
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F4F1EC]"
        >
      {/* Background Decorative Elements - Subtle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-red/20"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-navy/10"></div>
      </div>

      <div className="relative">
        {/* Main Spinner - Sharp Boxed */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="relative z-10 p-4 bg-white border border-slate-200 rounded-none shadow-none"
        >
          <Loader2 className="w-12 h-12 text-[var(--brand-navy)]" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-center px-6"
      >
        <h2 className="text-xl font-bold text-[var(--brand-navy)] uppercase tracking-widest">{message}</h2>
        <p className="mt-2 text-[var(--brand-red)] font-semibold uppercase text-[10px] tracking-widest">{submessage}</p>
      </motion.div>

      {/* Progress Bar - Minimalist */}
      <div className="mt-8 w-48 h-0.5 bg-slate-200 rounded-none overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-full h-full bg-[var(--brand-navy)]"
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
);
};

export default LoadingScreen;

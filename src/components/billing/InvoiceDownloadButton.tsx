'use client';

import React, { useRef, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InvoiceTemplate } from './InvoiceTemplate';
import { type Invoice } from '@/types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InvoiceDownloadButtonProps {
  invoice: Invoice;
  variant?: 'icon' | 'full';
  className?: string;
}

export function InvoiceDownloadButton({ invoice, variant = 'icon', className }: InvoiceDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = toast.loading('Downloading invoice PDF...');
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/download`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const fileName = `Invoice_${invoice.id}_${invoice.client_name?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully', { id: toastId });
    } catch (error: any) {
      console.error('PDF Download Error:', error);
      toast.error(error.message || 'Failed to download PDF', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={cn(
          "transition-all disabled:opacity-50",
          variant === 'icon' 
            ? "p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" 
            : "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100",
          className
        )}
        title="Download Invoice"
      >
        {isGenerating ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download size={variant === 'icon' ? 16 : 18} />
        )}
        {variant === 'full' && (isGenerating ? 'Generating...' : 'Download Invoice')}
      </button>

      {/* Hidden template for PDF generation */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">
        <div ref={printRef} className="w-[210mm] bg-white">
          <InvoiceTemplate invoice={invoice} />
        </div>
      </div>

      {/* Global Overlay during generation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[2px] pointer-events-auto"
          >
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-700">Generating Invoice PDF...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

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
import api from '@/lib/api';

interface InvoiceDownloadButtonProps {
  invoice: Invoice;
  variant?: 'icon' | 'full';
  className?: string;
}

export function InvoiceDownloadButton({ invoice, variant = 'icon', className }: InvoiceDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = toast.loading('Downloading invoice PDF...');
    setIsDownloading(true);
    try {
      const response = await api.get(`/api/invoices/${invoice.id}/download`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
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
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn(
        "transition-all disabled:opacity-50",
        variant === 'icon' 
          ? "p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" 
          : "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100",
        className
      )}
      title="Download Invoice"
    >
      {isDownloading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download size={variant === 'icon' ? 16 : 18} />
      )}
      {variant === 'full' && (isDownloading ? 'Downloading...' : 'Download Invoice')}
    </button>
  );
}

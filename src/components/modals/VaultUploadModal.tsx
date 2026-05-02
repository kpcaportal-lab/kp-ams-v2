'use client';

import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface VaultUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  clientName: string;
  onSuccess?: () => void;
}

export default function VaultUploadModal({ isOpen, onClose, assignmentId, clientName, onSuccess }: VaultUploadModalProps) {
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl) return;

    try {
      setIsSubmitting(true);
      await api.patch(`/api/assignments/${assignmentId}/vault`, { file_url: fileUrl });
      setIsSuccess(true);
      toast.success('Document uploaded to vault');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        // Reset state after closing
        setTimeout(() => {
          setIsSuccess(false);
          setFileUrl('');
        }, 300);
      }, 1500);
    } catch (err: unknown) {
      console.error('Vault upload error:', err);
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to upload document';
      toast.error(errorMessage || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative w-full max-w-lg bg-white border border-slate-200 shadow-none overflow-hidden rounded-none"
          >
            {/* Header */}
            <div className="bg-[var(--brand-navy)] px-8 py-6 flex items-center justify-between border-b border-brand-red/30">
              <div>
                <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">Upload Working Paper</h3>
                <p className="text-[10px] font-bold !text-slate-200 uppercase tracking-widest mt-1">{clientName}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 text-white/60 hover:text-white transition-colors rounded-none">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-slate-50 border border-slate-200 flex items-center justify-center text-[var(--brand-navy)] mb-6 rounded-none">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-[var(--brand-navy)] mb-2 uppercase tracking-tight">Vault Updated</h4>
                  <p className="text-slate-500 text-sm">The document link has been securely saved to the assignment vault.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border-l-4 border-[var(--brand-red)] flex items-start gap-4 rounded-none">
                    <div className="p-2 bg-white border border-slate-200 text-[var(--brand-navy)] rounded-none">
                      <FileText size={18} />
                    </div>
                    <p className="text-xs font-medium text-[var(--brand-navy)] leading-relaxed">
                      Enter the secure link to your working paper (Google Drive, SharePoint, etc.).
                      This document will be accessible in the firm&apos;s Document Vault.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Document URL</label>
                    <div className="relative group">
                      <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--brand-navy)] transition-colors" />
                      <input
                        autoFocus
                        required
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-4 border border-slate-200 text-sm font-bold text-slate-400 hover:bg-slate-50 transition-all rounded-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !fileUrl}
                      className="flex-[2] py-4 bg-[var(--brand-navy)] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[var(--brand-navy-900)] transition-all disabled:opacity-50 rounded-none uppercase tracking-widest"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload size={18} />
                          Secure to Vault
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

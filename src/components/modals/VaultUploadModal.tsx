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
    } catch (err: any) {
      console.error('Vault upload error:', err);
      toast.error(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-50 px-8 py-6 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Upload Working Paper</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{clientName}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 border-4 border-emerald-100">
                    <CheckCircle2 size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 mb-2">Vault Updated!</h4>
                  <p className="text-slate-500 font-medium">The document link has been securely saved to the assignment vault.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <p className="text-xs font-bold text-blue-700 leading-relaxed">
                      Enter the secure link to your working paper (Google Drive, SharePoint, etc.). 
                      This document will be accessible in the firm's Document Vault.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Document URL</label>
                    <div className="relative group">
                      <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        autoFocus
                        required
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all shadow-inner-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-4 rounded-2xl border border-slate-200 text-sm font-black text-slate-400 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !fileUrl}
                      className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload size={18} strokeWidth={3} />
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

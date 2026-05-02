'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText } from 'lucide-react';
import { useBillingStore } from '@/store/billingStore';
import api from '@/lib/api';

interface AssignmentOption {
  id: string;
  client_name?: string;
  scope_item?: string;
  subcategory?: string;
  category?: string;
  fiscal_year?: string;
}

interface AddInvoiceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AddInvoiceModal({ open, setOpen }: AddInvoiceModalProps) {
  const { addInvoice } = useBillingStore();
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [form, setForm] = useState({
    assignment_id: '',
    professional_fees: 0,
    out_of_pocket: 0,
    narration: '',
    udin: '',
    invoice_date: new Date().toISOString().split('T')[0]
  });

  // Fetch assignments when modal opens
  useEffect(() => {
    if (open) {
      api.get('/api/assignments').then(res => {
        setAssignments(res.data || []);
      }).catch(() => setAssignments([]));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.assignment_id) {
      alert('Please select an assignment.');
      return;
    }
    if (!form.narration.trim()) {
      alert('Please enter a narration.');
      return;
    }

    const assignment = assignments.find(a => a.id === form.assignment_id);

    await addInvoice({
      assignment_id: form.assignment_id,
      client_name: assignment?.client_name,
      professional_fees: form.professional_fees,
      out_of_pocket: form.out_of_pocket,
      narration: form.narration,
      udin: form.udin || undefined,
      invoice_date: form.invoice_date,
      net_amount: form.professional_fees + form.out_of_pocket,
    });
    setOpen(false);
    setForm({
      assignment_id: '',
      professional_fees: 0,
      out_of_pocket: 0,
      narration: '',
      udin: '',
      invoice_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-none shadow-none border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-brand-navy">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-white/10 flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold !text-white tracking-tight">New Invoice</h2>
                  <p className="text-[11px] !text-slate-200 mt-0.5 font-bold uppercase tracking-widest">K&P Billing Module</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-none hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                {/* Assignment Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Select Assignment</label>
                  <select
                    required
                    value={form.assignment_id}
                    onChange={(e) => setForm({ ...form, assignment_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select an assignment</option>
                    {assignments.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.client_name} — {a.scope_item || a.subcategory || a.category || 'Assignment'} ({a.fiscal_year || ''})
                      </option>
                    ))}
                  </select>
                  {assignments.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-semibold px-1">No assignments found. Create assignments first.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Professional Fees */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Professional Fees (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        value={form.professional_fees || ''}
                        onChange={(e) => setForm({ ...form, professional_fees: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Out of Pocket */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Out of Pocket (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        value={form.out_of_pocket || ''}
                        onChange={(e) => setForm({ ...form, out_of_pocket: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Narration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Narration</label>
                  <textarea
                    required
                    value={form.narration}
                    onChange={(e) => setForm({ ...form, narration: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-medium focus:border-brand-navy outline-none transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Enter invoice details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* UDIN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">UDIN (Optional)</label>
                    <input
                      value={form.udin}
                      onChange={(e) => setForm({ ...form, udin: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all"
                      placeholder="Enter UDIN"
                    />
                  </div>

                  {/* Invoice Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Invoice Date</label>
                    <input
                      type="date"
                      required
                      value={form.invoice_date}
                      onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-6 py-3.5 rounded-none border border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 rounded-none bg-brand-navy text-white text-xs font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-all border-b-2 border-brand-red flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Generate Invoice
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

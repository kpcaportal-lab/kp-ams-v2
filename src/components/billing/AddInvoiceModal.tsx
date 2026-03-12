'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBillingStore } from '@/store/billingStore';
import { useAssignmentStore } from '@/store/assignmentStore';

interface AddInvoiceModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AddInvoiceModal({ open, setOpen }: AddInvoiceModalProps) {
  const { addInvoice } = useBillingStore();
  const { assignments } = useAssignmentStore();
  const [form, setForm] = useState({
    assignment_id: '',
    professional_fees: 0,
    out_of_pocket: 0,
    narration: '',
    udin: '',
    invoice_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignment = assignments.find(a => a.id === form.assignment_id);
    if (!assignment) return;

    addInvoice({
      ...form,
      id: Math.random().toString(36).substr(2, 9),
      client_id: assignment.client_id,
      client_name: assignment.client_name,
      net_amount: form.professional_fees + form.out_of_pocket,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Generate New Invoice</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Select Assignment</label>
            <select required value={form.assignment_id} onChange={(e) => setForm({ ...form, assignment_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium bg-white">
              <option value="">Select an assignment</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.client_name} - {a.scope_item || a.subcategory}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Professional Fees</label>
              <input type="number" required value={form.professional_fees} onChange={(e) => setForm({ ...form, professional_fees: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Out of Pocket</label>
              <input type="number" required value={form.out_of_pocket} onChange={(e) => setForm({ ...form, out_of_pocket: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Narration</label>
            <textarea required value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium min-h-[80px]"
              placeholder="Enter invoice details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">UDIN (Optional)</label>
              <input value={form.udin} onChange={(e) => setForm({ ...form, udin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Invoice Date</label>
              <input type="date" required value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-[0_2px_8_rgba(37,99,235,0.3)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all">
              Generate Invoice
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

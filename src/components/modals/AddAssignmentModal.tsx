'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, AssignmentCategory, AssignmentSubcategory, BillingCycle, User } from '@/types';
import api from '@/lib/api';

interface AddAssignmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ClientOption {
  id: string;
  name: string;
}

interface FormData {
  client_id: string;
  gstn: string;
  partner_id: string;
  manager_id: string;
  category: AssignmentCategory;
  subcategory: AssignmentSubcategory;
  total_fees: number;
  billing_cycle: BillingCycle;
  fiscal_year: string;
  scope_item: string;
  scope_areas: string;
}

export default function AddAssignmentModal({ open, setOpen }: AddAssignmentModalProps) {
  const { addAssignment } = useAssignmentStore();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [partners, setPartners] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [form, setForm] = useState<FormData>({
    client_id: '',
    gstn: '',
    partner_id: '',
    manager_id: '',
    category: 'A',
    subcategory: 'statutory_audit',
    total_fees: 0,
    billing_cycle: 'monthly',
    fiscal_year: '2025-26',
    scope_item: '',
    scope_areas: ''
  });

  useEffect(() => {
    if (open) {
      api.get('/api/clients').then(res => {
        setClients(res.data.map((c: ClientOption) => ({ id: c.id, name: c.name })));
      }).catch(() => setClients([]));
      
      api.get('/api/users/partners').then(res => {
        setPartners(res.data || []);
      }).catch(() => setPartners([]));

      api.get('/api/users/managers').then(res => {
        setManagers(res.data || []);
      }).catch(() => setManagers([]));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizeUUID = (val: string) => (val && val.includes('-')) ? val : undefined;

    const payload = {
      ...form,
      partner_id: sanitizeUUID(form.partner_id),
      manager_id: sanitizeUUID(form.manager_id)
    };
    await addAssignment(payload);
    setOpen(false);
    setForm({
      client_id: '',
      gstn: '',
      partner_id: '',
      manager_id: '',
      category: 'A',
      subcategory: 'statutory_audit',
      total_fees: 0,
      billing_cycle: 'monthly',
      fiscal_year: '2025-26',
      scope_item: '',
      scope_areas: ''
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
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-[var(--brand-navy)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--brand-gold)] tracking-tight font-accent">Add New Assignment</h2>
                <p className="text-xs text-[var(--brand-gold)]/60 mt-0.5 font-medium">Create a new client engagement</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 text-[var(--brand-gold)]/60 hover:text-[var(--brand-gold)] transition-all border border-transparent hover:border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                {/* Client Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Client</label>
                  <select
                    required
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select a client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* GSTN */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">GSTN</label>
                  <input
                    required
                    value={form.gstn}
                    onChange={(e) => setForm({ ...form, gstn: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all placeholder:text-slate-300 pattern-uppercase"
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>

                {/* Scope Item */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Scope Title</label>
                  <input
                    required
                    value={form.scope_item}
                    onChange={(e) => setForm({ ...form, scope_item: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all placeholder:text-slate-300"
                    placeholder="e.g. Statutory Audit FY 23-24"
                  />
                </div>

                {/* Scope Areas */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Detailed Scope Areas</label>
                  <textarea
                    required
                    rows={3}
                    value={form.scope_areas}
                    onChange={(e) => setForm({ ...form, scope_areas: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Describe the scope areas in detail..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as AssignmentCategory })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Subcategory</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value as AssignmentSubcategory })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      {Object.entries(SUBCATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Fiscal Year */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Fiscal Year</label>
                    <select
                      value={form.fiscal_year}
                      onChange={(e) => setForm({ ...form, fiscal_year: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2026-27">2026-27</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Total Fees */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Professional Fees (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        value={form.total_fees || ''}
                        onChange={(e) => setForm({ ...form, total_fees: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Billing Cycle */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Professional Fees Cycle</label>
                    <select
                      value={form.billing_cycle}
                      onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as BillingCycle })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Partner Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Partner</label>
                    <select
                      value={form.partner_id}
                      onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select partner</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manager Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Manager</label>
                    <select
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select manager</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-6 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-[var(--brand-navy)] text-[var(--brand-gold)] text-sm font-bold shadow-[0_8px_20px_rgba(30,58,95,0.25)] hover:shadow-[0_12px_28px_rgba(30,58,95,0.35)] hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

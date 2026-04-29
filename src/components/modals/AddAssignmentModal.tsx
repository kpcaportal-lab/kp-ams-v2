'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">New Assignment</h2>
                <p className="text-[11px] text-white/60 mt-0.5 font-bold uppercase tracking-widest">K&P Firm Intelligence</p>
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
                {/* Client Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Client Identity</label>
                  <select
                    required
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select a client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* GSTN */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">GSTN / Tax Identifier</label>
                  <input
                    required
                    value={form.gstn}
                    onChange={(e) => setForm({ ...form, gstn: e.target.value })}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>

                {/* Scope Item */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assignment Title</label>
                  <input
                    required
                    value={form.scope_item}
                    onChange={(e) => setForm({ ...form, scope_item: e.target.value })}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                    placeholder="e.g. Statutory Audit FY 23-24"
                  />
                </div>

                {/* Scope Areas */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Defined Scope Areas</label>
                  <textarea
                    required
                    rows={3}
                    value={form.scope_areas}
                    onChange={(e) => setForm({ ...form, scope_areas: e.target.value })}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-medium focus:border-brand-navy outline-none transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Describe scope areas..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Service Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as AssignmentCategory })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subcategory</label>
                    <select
                      value={form.subcategory}
                      onChange={(e) => setForm({ ...form, subcategory: e.target.value as AssignmentSubcategory })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      {Object.entries(SUBCATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Total Fees */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Fees (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        value={form.total_fees || ''}
                        onChange={(e) => setForm({ ...form, total_fees: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Billing Cycle */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Billing Cycle</label>
                    <select
                      value={form.billing_cycle}
                      onChange={(e) => setForm({ ...form, billing_cycle: e.target.value as BillingCycle })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Partner</label>
                    <select
                      value={form.partner_id}
                      onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select partner</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manager Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Manager</label>
                    <select
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
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
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-6 py-3.5 rounded-none border border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 rounded-none bg-brand-navy text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all border-b-2 border-brand-red"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

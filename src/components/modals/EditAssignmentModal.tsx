'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, Assignment, AssignmentCategory, AssignmentSubcategory, BillingCycle, User } from '@/types';
import api from '@/lib/api';

interface EditAssignmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  assignment: Assignment;
}

interface FormData {
  gstn: string;
  category: AssignmentCategory;
  subcategory: AssignmentSubcategory;
  total_fees: number;
  billed_amount: number;
  out_of_pocket: number;
  billing_cycle: BillingCycle;
  scope_item: string;
  scope_areas: string;
  partner_id: string;
  manager_id: string;
  amount_receipt: number;
}

export default function EditAssignmentModal({ open, setOpen, assignment }: EditAssignmentModalProps) {
  const { updateAssignment } = useAssignmentStore();
  const [partners, setPartners] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [form, setForm] = useState<FormData>({
    gstn: '',
    category: 'A',
    subcategory: 'internal_audit',
    total_fees: 0,
    billed_amount: 0,
    out_of_pocket: 0,
    billing_cycle: 'monthly',
    scope_item: '',
    scope_areas: '',
    partner_id: '',
    manager_id: '',
    amount_receipt: 0
  });

  useEffect(() => {
    if (open) {
      api.get('/api/users/partners').then(res => {
        setPartners(res.data || []);
      }).catch(() => setPartners([]));

      api.get('/api/users/managers').then(res => {
        setManagers(res.data || []);
      }).catch(() => setManagers([]));
    }
  }, [open]);

  const initialForm = useMemo(() => ({
    gstn: assignment.gstn || '',
    category: assignment.category,
    subcategory: assignment.subcategory || 'internal_audit' as AssignmentSubcategory,
    total_fees: assignment.total_fees ?? assignment.fees ?? 0,
    billed_amount: assignment.billed_amount ?? 0,
    out_of_pocket: assignment.out_of_pocket ?? 0,
    billing_cycle: assignment.billing_cycle || 'monthly' as BillingCycle,
    scope_item: assignment.scope_item || assignment.subcategory || '',
    scope_areas: assignment.scope_areas || '',
    partner_id: assignment.partner_id || '',
    manager_id: assignment.manager_id || '',
    amount_receipt: assignment.amount_receipt ?? 0
  }), [assignment]);

  useEffect(() => {
    if (assignment) {
      setForm(initialForm);
    }
  }, [initialForm, assignment]);

  const billingPct = form.total_fees > 0 ? ((form.billed_amount / form.total_fees) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizeUUID = (val: string) => (val && val.includes('-')) ? val : undefined;

    await updateAssignment(assignment.id, {
      gstn: form.gstn,
      category: form.category,
      subcategory: form.subcategory,
      total_fees: form.total_fees,
      billed_amount: form.billed_amount,
      out_of_pocket: form.out_of_pocket,
      billing_cycle: form.billing_cycle,
      scope_item: form.scope_item,
      scope_areas: form.scope_areas || form.scope_item,
      partner_id: sanitizeUUID(form.partner_id),
      manager_id: sanitizeUUID(form.manager_id),
      amount_receipt: form.amount_receipt
    } as Partial<Assignment>);
    setOpen(false);
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
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header - Fixed */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10 bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Assignment</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Update assignment details</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-8 space-y-5">

              <div className="space-y-4">
                {/* Client Name (read-only) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Client</label>
                  <div className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-600">
                    {assignment.client_name || 'N/A'}
                  </div>
                </div>

                {/* GSTN */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">GSTN</label>
                  <input
                    required
                    value={form.gstn}
                    onChange={(e) => setForm({ ...form, gstn: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 pattern-uppercase"
                    placeholder="29ABCDE1234F1Z5"
                  />
                </div>

                {/* Scope Item */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Scope of Work</label>
                  <input
                    value={form.scope_item}
                    onChange={(e) => setForm({ ...form, scope_item: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300"
                    placeholder="e.g. Statutory Audit FY 23-24"
                  />
                </div>

                {/* Detailed Scope Areas */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Detailed Scope Areas</label>
                  <textarea
                    required
                    value={form.scope_areas}
                    onChange={(e) => setForm({ ...form, scope_areas: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 min-h-[100px] resize-none"
                    placeholder="Describe specific audit areas, locations, or deliverables..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as AssignmentCategory })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
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
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
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
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Professional Fees (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        value={form.total_fees || ''}
                        onChange={(e) => setForm({ ...form, total_fees: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all"
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
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Billed Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Billed (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={form.billed_amount || ''}
                        onChange={(e) => setForm({ ...form, billed_amount: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Out of Pocket */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Out of Pocket (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={form.out_of_pocket || ''}
                        onChange={(e) => setForm({ ...form, out_of_pocket: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 focus:bg-white transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Received Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Received (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={form.amount_receipt || ''}
                        onChange={(e) => setForm({ ...form, amount_receipt: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing % Indicator (read-only) */}
                {form.total_fees > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Billing %</span>
                      <span className="text-sm font-black text-slate-900">{billingPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          billingPct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                          billingPct >= 40 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                          'bg-gradient-to-r from-amber-400 to-orange-400'
                        }`}
                        style={{ width: `${Math.min(billingPct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Partner Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Partner</label>
                    <select
                      value={form.partner_id}
                      onChange={(e) => setForm({ ...form, partner_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
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
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
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
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

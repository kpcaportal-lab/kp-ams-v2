'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Users, Mail, Phone } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';

interface AddClientModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddClientModal({ open, setOpen }: AddClientModalProps) {
  const { addClient } = useClientStore();
  const [form, setForm] = useState({
    name: '',
    industry: '',
    address: '',
    billing_details: '',
    status: 'active' as 'active' | 'inactive',
    spocName: '',
    spocEmail: '',
    spocPhone: '',
    gstn: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(form);
    setOpen(false);
    // Reset form
    setForm({
      name: '',
      industry: '',
      address: '',
      billing_details: '',
      status: 'active',
      spocName: '',
      spocEmail: '',
      spocPhone: '',
      gstn: '',
      notes: '',
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
                  <Building2 className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold !text-white tracking-tight">Add Client</h2>
                  <p className="text-[11px] !text-slate-200 mt-0.5 font-bold uppercase tracking-widest">K&P Registration Portal</p>
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
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Legal Entity Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                    placeholder="e.g. Acme Corp India"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Industry Vertical</label>
                    <select
                      required
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Industry</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="FMCG">FMCG</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Operational Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* GSTN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">GSTN / Tax ID</label>
                    <input
                      value={form.gstn}
                      onChange={(e) => setForm({ ...form, gstn: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. 27AAAC..."
                    />
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Internal Reference</label>
                    <input
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                      placeholder="Audit notes..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Registered Address</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-medium focus:border-brand-navy outline-none transition-all placeholder:text-slate-300 resize-none h-20"
                      placeholder="Client's office address"
                    />
                  </div>

                  {/* Billing Details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Billing Instructions</label>
                    <textarea
                      value={form.billing_details}
                      onChange={(e) => setForm({ ...form, billing_details: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-medium focus:border-brand-navy outline-none transition-all placeholder:text-slate-300 resize-none h-20"
                      placeholder="Specific instructions..."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Single Point of Contact (SPOC)</h3>

                  <div className="space-y-4">
                    {/* SPOC Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                      <input
                        required
                        value={form.spocName}
                        onChange={(e) => setForm({ ...form, spocName: e.target.value })}
                        className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* SPOC Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={form.spocEmail}
                          onChange={(e) => setForm({ ...form, spocEmail: e.target.value })}
                          className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                          placeholder="john@example.com"
                        />
                      </div>

                      {/* SPOC Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Direct Phone</label>
                        <input
                          required
                          value={form.spocPhone}
                          onChange={(e) => setForm({ ...form, spocPhone: e.target.value })}
                          className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
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
                  Save Record
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

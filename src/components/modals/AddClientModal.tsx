'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Users, Mail, Phone, Briefcase } from 'lucide-react';
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
    status: 'active' as 'active' | 'inactive',
    spocName: '',
    spocEmail: '',
    spocPhone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient(form);
    setOpen(false);
    // Reset form
    setForm({
      name: '',
      industry: '',
      status: 'active',
      spocName: '',
      spocEmail: '',
      spocPhone: '',
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
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add Client</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Register a new client in the system</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Client Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300"
                    placeholder="e.g. Acme Corp India"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Industry</label>
                    <select
                      required
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Industry</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="FMCG">FMCG</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">SPOC Details</h3>
                  
                  <div className="space-y-4">
                    {/* SPOC Name */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 px-1">
                        <Users size={12} className="text-slate-400" />
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact Name</label>
                      </div>
                      <input
                        required
                        value={form.spocName}
                        onChange={(e) => setForm({ ...form, spocName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* SPOC Email */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                          <Mail size={12} className="text-slate-400" />
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                        </div>
                        <input
                          type="email"
                          required
                          value={form.spocEmail}
                          onChange={(e) => setForm({ ...form, spocEmail: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300"
                          placeholder="john@example.com"
                        />
                      </div>

                      {/* SPOC Phone */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                          <Phone size={12} className="text-slate-400" />
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                        </div>
                        <input
                          required
                          value={form.spocPhone}
                          onChange={(e) => setForm({ ...form, spocPhone: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>
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
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Client
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

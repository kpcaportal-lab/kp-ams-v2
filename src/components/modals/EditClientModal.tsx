'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Users, Mail, Phone, Trash2 } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';
import type { Client } from '@/types';

interface EditClientModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  client: Client | null;
}

export default function EditClientModal({ open, setOpen, client }: EditClientModalProps) {
  const { updateClient, deleteClient } = useClientStore();
  const [form, setForm] = useState({
    name: '',
    industry: '',
    status: 'active' as 'active' | 'inactive',
    spocName: '',
    spocEmail: '',
    spocPhone: '',
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        industry: client.industry || '',
        status: client.status as 'active' | 'inactive',
        spocName: client.spocName || '',
        spocEmail: client.spocEmail || '',
        spocPhone: client.spocPhone || '',
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      updateClient(client.id, form);
      setOpen(false);
    }
  };

  const handleDelete = () => {
    if (client && confirm(`Are you sure you want to delete ${client.name}?`)) {
      deleteClient(client.id);
      setOpen(false);
    }
  };

  if (!client) return null;

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
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <Building2 className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Client</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Update client profile and contact details</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                  title="Delete Client"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200"
                >
                  <X size={20} />
                </button>
              </div>
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
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="e.g. Acme Corp India"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Industry</label>
                    <input
                      required
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-300 shadow-sm"
                      placeholder="e.g. Technology"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer appearance-none shadow-sm"
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
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-300 shadow-sm"
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
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-300 shadow-sm"
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
                          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-300 shadow-sm"
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
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-[0_8px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Update Client
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

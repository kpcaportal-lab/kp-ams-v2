'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Users, Mail, Phone, Trash2 } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';
import type { Client } from '@/types';

interface EditClientModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  client: Client | null;
}

interface FormData {
  name: string;
  industry: string;
  address: string;
  billing_details: string;
  status: 'active' | 'inactive';
  spocName: string;
  spocEmail: string;
  spocPhone: string;
  gstn: string;
  notes: string;
}

export default function EditClientModal({ open, setOpen, client }: EditClientModalProps) {
  const { updateClient, deleteClient } = useClientStore();
  const [form, setForm] = useState<FormData>({
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

  const initialForm = useMemo((): FormData => ({
    name: client?.name || '',
    industry: client?.industry || '',
    address: client?.address || '',
    billing_details: client?.billing_details || '',
    status: (client?.status === 'active' || client?.status === 'inactive') ? client.status : 'active',
    spocName: client?.spocName || '',
    spocEmail: client?.spocEmail || '',
    spocPhone: client?.spocPhone || '',
    gstn: client?.gstn || '',
    notes: client?.notes || '',
  }), [client]);

  useEffect(() => {
    if (open && client) {
      // eslint-disable-next-line
      setForm(initialForm);
    }
  }, [initialForm, open, client]);

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative w-full max-w-lg bg-white border border-slate-200 shadow-none overflow-hidden rounded-none"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-brand-red/30 flex items-center justify-between bg-[var(--brand-navy)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center border border-white/20 rounded-none">
                  <Building2 className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">Edit Client</h2>
                  <p className="text-xs !text-slate-200 mt-0.5 font-medium uppercase tracking-widest">Update Profile & Contacts</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  type="button"
                  className="w-10 h-10 flex items-center justify-center hover:bg-rose-500/10 text-white/60 hover:text-rose-400 transition-all rounded-none"
                  title="Delete Client"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  type="button"
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-all rounded-none"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Institutional Client Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300"
                    placeholder="e.g. Acme Corp India"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Industry</label>
                    <input
                      required
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. Technology"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Institutional Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* GSTN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">GSTN Identification</label>
                    <input
                      value={form.gstn}
                      onChange={(e) => setForm({ ...form, gstn: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300 uppercase"
                      placeholder="e.g. 27AAAC..."
                    />
                  </div>

                  {/* Internal Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Internal Reference</label>
                    <input
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300"
                      placeholder="Internal reference..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Registered Address</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300 resize-none h-20"
                      placeholder="Client's office address"
                    />
                  </div>

                  {/* Billing Details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Billing Protocol</label>
                    <textarea
                      value={form.billing_details}
                      onChange={(e) => setForm({ ...form, billing_details: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300 resize-none h-20"
                      placeholder="Specific billing instructions"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-[10px] font-extrabold text-[var(--brand-navy)] uppercase tracking-widest mb-4 opacity-60">Primary Liaison</h3>
                  
                  <div className="space-y-4">
                    {/* SPOC Name */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 px-1">
                        <Users size={12} className="text-[var(--brand-red)]" />
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Liaison Officer</label>
                      </div>
                      <input
                        required
                        value={form.spocName}
                        onChange={(e) => setForm({ ...form, spocName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300"
                        placeholder="e.g. John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* SPOC Email */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                          <Mail size={12} className="text-[var(--brand-red)]" />
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Institutional Email</label>
                        </div>
                        <input
                          type="email"
                          required
                          value={form.spocEmail}
                          onChange={(e) => setForm({ ...form, spocEmail: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300"
                          placeholder="john@example.com"
                        />
                      </div>

                      {/* SPOC Phone */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 px-1">
                          <Phone size={12} className="text-[var(--brand-red)]" />
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Contact Protocol</label>
                        </div>
                        <input
                          required
                          value={form.spocPhone}
                          onChange={(e) => setForm({ ...form, spocPhone: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-[var(--brand-navy)] rounded-none transition-all placeholder:text-slate-300"
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
                  className="flex-1 px-6 py-4 border border-slate-200 text-[10px] font-extrabold text-slate-500 hover:bg-slate-50 transition-all rounded-none uppercase tracking-widest"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-[var(--brand-navy)] text-white text-[10px] font-extrabold transition-all flex items-center justify-center gap-2 rounded-none uppercase tracking-widest border-b-2 border-brand-red"
                >
                  <Save size={16} />
                  Commit Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

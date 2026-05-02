'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText } from 'lucide-react';
import { useProposalStore } from '@/store/proposalStore';
import { ASSIGNMENT_TYPE_LABELS, ProposalType, AssignmentType } from '@/types';
import api from '@/lib/api';

interface AddProposalModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ClientOption {
  id: string;
  name: string;
}

export default function AddProposalModal({ open, setOpen }: AddProposalModalProps) {
  const { addProposal } = useProposalStore();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [form, setForm] = useState({
    client_id: '',
    proposal_type: 'new' as ProposalType,
    assignment_type: 'internal_audit' as AssignmentType,
    quotation_amount: 0,
    fiscal_year: '2025-26',
    scope_areas: '',
    notes: '',
    responsible_partner: '',
    manager_id: ''
  });

  useEffect(() => {
    if (open) {
      api.get('/api/clients').then(res => {
        setClients(res.data.map((c: ClientOption) => ({ id: c.id, name: c.name })));
      }).catch(() => setClients([]));

      api.get('/api/users/partners').then(res => setPartners(res.data)).catch(() => setPartners([]));
      api.get('/api/users/managers').then(res => setManagers(res.data)).catch(() => setManagers([]));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation — ensure required UUID fields are selected
    if (!form.client_id) {
      alert('Please select a client.');
      return;
    }
    if (!form.responsible_partner) {
      alert('Please select an Engagement Partner.');
      return;
    }
    if (!form.manager_id) {
      alert('Please select a Project Lead.');
      return;
    }
    if (!form.scope_areas.trim()) {
      alert('Please define the service scope.');
      return;
    }

    console.log('📤 Submitting proposal payload:', JSON.stringify(form, null, 2));

    const result = await addProposal(form);
    if (result) {
      setOpen(false);
      // Reset form
      setForm({
        client_id: '',
        proposal_type: 'new',
        assignment_type: 'internal_audit',
        quotation_amount: 0,
        fiscal_year: '2025-26',
        scope_areas: '',
        notes: '',
        responsible_partner: '',
        manager_id: ''
      });
    }
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
                  <h2 className="text-xl font-extrabold !text-white tracking-tight">New Proposal</h2>
                  <p className="text-[11px] !text-slate-200 mt-0.5 font-bold uppercase tracking-widest">K&P Fee Architecture</p>
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
                {/* Client Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Client Identity</label>
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Responsible Partner */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Engagement Partner</label>
                    <select
                      required
                      value={form.responsible_partner}
                      onChange={(e) => setForm({ ...form, responsible_partner: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Partner</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manager/Lead */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Project Lead</label>
                    <select
                      required
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Lead</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Proposal Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Proposal Classification</label>
                    <select
                      value={form.proposal_type}
                      onChange={(e) => setForm({ ...form, proposal_type: e.target.value as ProposalType })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="new">New Proposal</option>
                      <option value="revision">Renewal</option>
                    </select>
                  </div>

                  {/* Assignment Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Service Type</label>
                    <select
                      value={form.assignment_type}
                      onChange={(e) => setForm({ ...form, assignment_type: e.target.value as AssignmentType })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      {Object.entries(ASSIGNMENT_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Quotation Amount */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Proposed Fees (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        value={form.quotation_amount || ''}
                        onChange={(e) => setForm({ ...form, quotation_amount: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Fiscal Year */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Financial Year</label>
                    <select
                      value={form.fiscal_year}
                      onChange={(e) => setForm({ ...form, fiscal_year: e.target.value })}
                      className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2026-27">2026-27</option>
                    </select>
                  </div>
                </div>

                {/* Scope Areas */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Service Scope Definition</label>
                  <textarea
                    required
                    value={form.scope_areas}
                    onChange={(e) => setForm({ ...form, scope_areas: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white text-sm font-medium focus:border-brand-navy outline-none transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Define scope boundaries..."
                  />
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
                  Draft Proposal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

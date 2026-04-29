'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useProposalStore } from '@/store/proposalStore';
import { useUserStore } from '@/store/userStore';
import { ASSIGNMENT_TYPE_LABELS, Proposal, ProposalType, AssignmentType, ProposalStatus } from '@/types';
import api from '@/lib/api';

interface EditProposalModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  proposal: Proposal;
}

interface ClientOption {
  id: string;
  name: string;
}

interface FormData {
  client_id: string;
  proposal_type: ProposalType;
  assignment_type: AssignmentType;
  quotation_amount: number;
  status: ProposalStatus;
  fiscal_year: string;
  responsible_partner: string;
  manager_id: string;
  notes: string;
}

export default function EditProposalModal({ open, setOpen, proposal }: EditProposalModalProps) {
  const { updateProposal } = useProposalStore();
  const { partners, managers, fetchPartners, fetchManagers } = useUserStore();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [form, setForm] = useState<FormData>({
    client_id: '',
    proposal_type: 'new',
    assignment_type: 'internal_audit',
    quotation_amount: 0,
    status: 'pending',
    fiscal_year: '2025-26',
    responsible_partner: '',
    manager_id: '',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      api.get('/api/clients').then(res => {
        setClients(res.data.map((c: ClientOption) => ({ id: c.id, name: c.name })));
      }).catch(() => setClients([]));
      
      if (partners.length === 0) fetchPartners();
      if (managers.length === 0) fetchManagers();
    }
  }, [open]);

  const initialForm = useMemo(() => ({
    client_id: proposal?.client_id || '',
    proposal_type: proposal?.proposal_type || 'new',
    assignment_type: proposal?.assignment_type || 'internal_audit',
    quotation_amount: proposal?.quotation_amount || 0,
    status: proposal?.status || 'pending',
    fiscal_year: proposal?.fiscal_year || '2025-26',
    responsible_partner: proposal?.responsible_partner || '',
    manager_id: proposal?.manager_id || '',
    notes: proposal?.notes || ''
  }), [proposal]);

  useEffect(() => {
    if (open && proposal) {
      // eslint-disable-next-line
      setForm(initialForm);
    }
  }, [initialForm, open, proposal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const backendProposalType = form.proposal_type === 'renewal' ? 'revision' : 'new';
    await updateProposal(proposal.id, {
      client_id: form.client_id,
      proposal_type: backendProposalType as ProposalType,
      assignment_type: form.assignment_type,
      quotation_amount: form.quotation_amount,
      status: form.status,
      fiscal_year: form.fiscal_year,
      responsible_partner: form.responsible_partner,
      manager_id: form.manager_id,
      notes: form.notes
    });
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative w-full max-w-lg bg-white border border-slate-200 shadow-none overflow-hidden rounded-none"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-brand-navy">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-none">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Modify Engagement</h2>
                  <p className="text-[11px] text-white/60 font-bold uppercase tracking-widest">Case ID: {proposal.number}</p>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Client Entity</label>
                  <select
                    required
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select a client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['pending', 'won', 'lost'] as ProposalStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        className={`flex items-center justify-center gap-1.5 py-3 rounded-none text-[10px] font-black border transition-all uppercase tracking-widest ${
                          form.status === s
                            ? s === 'won'
                              ? 'bg-brand-navy border-brand-navy text-white'
                              : s === 'lost'
                              ? 'bg-rose-700 border-rose-700 text-white'
                              : 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {s === 'won' && <CheckCircle2 size={12} />}
                        {s === 'lost' && <XCircle size={12} />}
                        {s === 'pending' && <Clock size={12} />}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Proposal Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Type</label>
                    <select
                      value={form.proposal_type}
                      onChange={(e) => setForm({ ...form, proposal_type: e.target.value as ProposalType })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="new">New Proposal</option>
                      <option value="revision">Renewal</option>
                    </select>
                  </div>

                  {/* Assignment Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Service Classification</label>
                    <select
                      value={form.assignment_type}
                      onChange={(e) => setForm({ ...form, assignment_type: e.target.value as AssignmentType })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all cursor-pointer appearance-none"
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fee Quotation (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                      <input
                        type="number"
                        required
                        value={form.quotation_amount || ''}
                        onChange={(e) => setForm({ ...form, quotation_amount: Number(e.target.value) })}
                        className="w-full pl-8 pr-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Fiscal Year */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Financial Period</label>
                    <select
                      value={form.fiscal_year}
                      onChange={(e) => setForm({ ...form, fiscal_year: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                      <option value="2026-27">2026-27</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Responsible Partner */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Signing Partner</label>
                    <select
                      required
                      value={form.responsible_partner}
                      onChange={(e) => setForm({ ...form, responsible_partner: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Partner</option>
                      {partners.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Manager/Lead */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Case Manager</label>
                    <select
                      required
                      value={form.manager_id}
                      onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Lead</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Internal Notes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Internal Reference / Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-black focus:border-brand-navy outline-none rounded-none transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Enter internal engagement notes..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 text-[10px] font-black text-slate-500 hover:bg-slate-50 transition-all rounded-none uppercase tracking-widest"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-brand-navy text-white text-[10px] font-black transition-all flex items-center justify-center gap-2 rounded-none uppercase tracking-widest border-b-2 border-brand-red"
                >
                  <Save size={16} />
                  Authorize Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

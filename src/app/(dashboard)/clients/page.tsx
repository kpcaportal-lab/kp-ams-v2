'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Users, Building2, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';
import { formatDate } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AddClientModal from '@/components/modals/AddClientModal';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

export default function ClientsPage() {
  const { clients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.spocName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [clients, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
  }), [clients]);

  const statusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <CheckCircle size={12} /> Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200/80 text-slate-500 border border-slate-300/40">
        <XCircle size={12} /> Inactive
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-accent">Client <span className="text-brand-gold">Intelligence</span></h1>
          <p className="text-sm text-slate-400 mt-1 font-medium italic">Manage and track your client portfolio engagements</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy text-white text-sm font-black shadow-[0_10px_20px_rgba(30,58,95,0.15)] hover:shadow-[0_15px_30px_rgba(30,58,95,0.25)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus size={18} strokeWidth={3} className="text-brand-gold" /> Add New Client
        </button>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clients', value: stats.total, icon: Users, color: 'text-brand-navy', bg: 'bg-brand-navy/5', accent: 'from-brand-navy to-slate-700' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/10', accent: 'from-emerald-500 to-teal-500' },
          { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-200/80', accent: 'from-slate-400 to-slate-500' },
        ].map((card, i) => (
          <motion.div key={card.label} custom={i} variants={fadeUp} initial="hidden" animate="visible"
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all duration-300">
            <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", card.accent)} />
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon size={18} className={card.color} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 tracking-tight">{card.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-navy transition-colors" />
          <input
            type="text"
            placeholder="Search clients, industry, or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy/30 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-brand-navy/5 focus:border-brand-navy/30 transition-all min-w-[160px] appearance-none cursor-pointer"
        >
          <option value="all">All Engagement Status</option>
          <option value="active">Active Accounts</option>
          <option value="inactive">Dormant Accounts</option>
        </select>
      </motion.div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client, i) => (
          <motion.div key={client.id} custom={i} variants={fadeUp} initial="hidden" animate="visible">
            <Link href={`/clients/${client.id}`}
              className="group block rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-[0_15px_30px_rgba(15,23,42,0.1)] hover:border-brand-navy/20 hover:-translate-y-1 transition-all duration-400">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center text-brand-gold font-black text-lg shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-900 truncate group-hover:text-brand-navy transition-colors">
                      {client.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{client.industry || 'Industry not specified'}</span>
                  </div>
                </div>
                {statusBadge(client.status)}
              </div>

              <div className="space-y-3 mt-6 pt-5 border-t border-slate-50">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Users size={14} className="text-brand-gold shrink-0" strokeWidth={2.5} />
                  <span className="font-bold text-slate-700">{client.spocName || 'No SPOC assigned'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{client.spocEmail || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium">{client.spocPhone || 'N/A'}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white/50">
          <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">No clients found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
        </motion.div>
      )}

      {/* Add Client Modal */}
      <AddClientModal open={showAddModal} setOpen={setShowAddModal} />
    </div>
  );
}


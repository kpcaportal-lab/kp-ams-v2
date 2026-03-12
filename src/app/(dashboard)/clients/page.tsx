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
        c.spocName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage your client portfolio</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus size={16} /> Add Client
        </button>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clients', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', accent: 'from-blue-600 to-indigo-600' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/10', accent: 'from-emerald-500 to-teal-500' },
          { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-200/80', accent: 'from-slate-400 to-slate-500' },
        ].map((card, i) => (
          <motion.div key={card.label} custom={i} variants={fadeUp} initial="hidden" animate="visible"
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all duration-300">
            <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", card.accent)} />
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon size={18} className={card.color} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900">{card.value}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, SPOC, industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </motion.div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client, i) => (
          <motion.div key={client.id} custom={i} variants={fadeUp} initial="hidden" animate="visible">
            <Link href={`/clients/${client.id}`}
              className="group block rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)] hover:border-slate-300/60 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                      {client.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">{client.industry}</span>
                  </div>
                </div>
                {statusBadge(client.status)}
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Users size={13} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{client.spocName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.spocEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{client.spocPhone}</span>
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


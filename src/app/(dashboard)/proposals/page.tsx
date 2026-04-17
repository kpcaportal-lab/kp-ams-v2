'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, FileText, CheckCircle, XCircle, Clock, TrendingUp, DollarSign, Briefcase, RotateCcw } from 'lucide-react';
import { useProposalStore } from '@/store/proposalStore';
import { ASSIGNMENT_TYPE_LABELS, formatDate } from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AddProposalModal from '@/components/modals/AddProposalModal';
import EditProposalModal from '@/components/modals/EditProposalModal';
import { Proposal } from '@/types';

import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProposalListPage() {
  const { proposals, isLoading, fetchProposals } = useProposalStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'client'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Move loading screen inside the main return to avoid hook violations

  const filteredProposals = useMemo(() => {
    const result = proposals.filter((p) => {
      const matchesSearch =
        p.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.partner_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPartner = partnerFilter === 'all' || p.partner_name === partnerFilter;
      const matchesCategory = categoryFilter === 'all' || p.fee_category === categoryFilter;
      const matchesClient = clientFilter === 'all' || p.client_id === clientFilter;
      
      const pDate = new Date(p.proposal_date);
      const matchesDateFrom = !dateFrom || pDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || pDate <= new Date(dateTo);
      
      const matchesAmountMin = !amountMin || p.quotation_amount >= Number(amountMin);
      const matchesAmountMax = !amountMax || p.quotation_amount <= Number(amountMax);

      return matchesSearch && matchesStatus && matchesPartner && matchesCategory && 
             matchesClient && matchesDateFrom && matchesDateTo && 
             matchesAmountMin && matchesAmountMax;
    });

    return result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.proposal_date).getTime() - new Date(b.proposal_date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.quotation_amount - b.quotation_amount;
      } else if (sortBy === 'client') {
        comparison = (a.client_name || '').localeCompare(b.client_name || '');
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [proposals, searchTerm, statusFilter, partnerFilter, categoryFilter, clientFilter, dateFrom, dateTo, amountMin, amountMax, sortBy, sortOrder]);

  const partners = useMemo(() => {
    const pSet = new Set(proposals.map(p => p.partner_name).filter(Boolean));
    return Array.from(pSet);
  }, [proposals]);

  // Statistics
  const stats = useMemo(() => {
    const total = proposals.length;
    const won = proposals.filter(p => p.status === 'won');
    const pending = proposals.filter(p => p.status === 'pending');
    
    const wonValue = won.reduce((sum, p) => sum + p.quotation_amount, 0);
    const pendingValue = pending.reduce((sum, p) => sum + p.quotation_amount, 0);
    const winRate = total > 0 ? (won.length / total) * 100 : 0;

    return {
      total,
      won: won.length,
      wonValue,
      pendingValue,
      winRate: winRate.toFixed(1)
    };
  }, [proposals]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={12} /> Won
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <XCircle size={12} /> Lost
          </span>
        );
      case 'pending_revision':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <RotateCcw size={12} /> Revision Pending
          </span>
        );
      case 'revised':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <RotateCcw size={12} /> Revised
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock size={12} /> Pending
          </span>
        );
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">{status}</span>;
    }
  };

  if (isLoading) return <LoadingScreen message="Strategic intelligence is being gathered..." />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            Proposals <span className="text-amber-500">Repository</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Strategic business development and proposal lifecycle tracking</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 hover:shadow-slate-300 transition-all border border-slate-800"
        >
          <Plus size={20} className="text-amber-400" /> 
          <span>Create Strategic Proposal</span>
        </motion.button>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Proposals', value: stats.total, icon: FileText, color: 'blue' },
          { label: 'Conversion Rate', value: `${stats.winRate}%`, icon: TrendingUp, color: 'emerald' },
          { label: 'Won Portfolio', value: formatIndianCurrency(stats.wonValue, true, true), icon: DollarSign, color: 'amber' },
          { label: 'Pipeline Value', value: formatIndianCurrency(stats.pendingValue, true, true), icon: Briefcase, color: 'indigo' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-${stat.color}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
              </div>
              <div className={cn(
                "p-3 rounded-2xl bg-white shadow-sm border border-slate-100 transition-transform group-hover:scale-110 group-hover:rotate-3",
                `text-${stat.color}-500`
              )}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search proposals, clients, or numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/50 backdrop-blur-md border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 lg:flex-none px-4 py-3.5 rounded-2xl bg-white/50 backdrop-blur-md border border-slate-200 focus:border-amber-400 outline-none transition-all font-bold text-slate-600 shadow-sm min-w-[180px]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">🟡 Pending Pipeline</option>
            <option value="won">🟢 Won Projects</option>
            <option value="lost">🔴 Lost Opportunities</option>
          </select>
          
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border transition-all shadow-sm active:scale-95 text-sm font-bold",
              showAdvanced ? "bg-amber-500 text-white border-amber-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Filter size={18} />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      {showAdvanced && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl"
        >
          <div className="space-y-2 text-slate-400">
            <label className="text-[10px] font-black uppercase tracking-[0.2em]">Strategy Matrix (Partner & Client)</label>
            <div className="flex gap-2">
              <select 
                value={partnerFilter} 
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 text-white"
              >
                <option value="all">Every Partner</option>
                {partners.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 text-white"
              >
                <option value="all">Every Category</option>
                <option value="new">New Client</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date Range</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 text-white"
              />
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amount Range (₹)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 text-white"
              />
              <input 
                type="number" 
                placeholder="Max"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sort Matrix</label>
            <div className="flex gap-2">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'client')}
                className="w-full bg-slate-800 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 text-white"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="client">Client</option>
              </select>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-slate-800 px-3 rounded-xl hover:bg-slate-700 transition-colors text-white"
                title="Toggle Sort Order"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-4 flex items-end justify-end">
             <button 
               onClick={() => { 
                 setPartnerFilter('all'); 
                 setCategoryFilter('all'); 
                 setStatusFilter('all'); 
                 setSearchTerm(''); 
                 setDateFrom('');
                 setDateTo('');
                 setAmountMin('');
                 setAmountMax('');
                 setSortBy('date');
                 setSortOrder('desc');
               }}
               className="text-xs font-bold text-slate-400 hover:text-white transition-colors underline flex items-center gap-2 pb-2"
             >
               <RotateCcw size={14} /> Clear All Tactical Overrides
             </button>
          </div>
        </motion.div>
      )}

      {/* Main Proposals Grid/Table Container */}
      <div className="rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl overflow-hidden shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50">
                <th className="px-8 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence & Date</th>
                <th className="px-8 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Client Portfolio</th>
                <th className="px-8 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Quotation Details</th>
                <th className="px-8 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Engagement Team</th>
                <th className="px-8 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right font-black text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal, idx) => (
                  <motion.tr 
                    key={proposal.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + (idx * 0.03) }}
                    className="hover:bg-amber-50/30 transition-all cursor-pointer group"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('button, a')) { // Added "a" to prevent link clicks from triggering row click
                        window.location.href = `/proposals/${proposal.id}`;
                      }
                    }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          <FileText size={18} />
                        </div>
                        <span className="font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                          {proposal.number}
                        </span>
                        {proposal.revision_flag && (
                          <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200 uppercase">Rev v{proposal.version_number}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 ml-11 font-bold">
                        <Clock size={12} /> {formatDate(proposal.proposal_date)}
                      </div>
                    </td>
                    
                    <td className="px-8 py-6">
                      <h4 className="font-bold text-slate-800 text-base leading-tight mb-1">{proposal.client_name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                          {ASSIGNMENT_TYPE_LABELS[proposal.assignment_type]}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                          {proposal.proposal_type}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="text-lg font-black text-slate-900 mb-0.5 tabular-nums">
                        {formatIndianCurrency(proposal.quotation_amount)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white font-mono",
                          proposal.fee_category === 'new' ? "bg-indigo-500" : "bg-teal-500"
                        )}>
                          {proposal.fee_category || 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic">Scale-based fee</span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {proposal.partner_name?.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{proposal.partner_name}</span>
                        </div>
                        <div className="text-[0.65rem] text-slate-400 ml-8 font-medium italic">
                          Drafted by: {proposal.prepared_by_name}
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      {getStatusBadge(proposal.status)}
                    </td>

                    <td className="px-8 py-6 text-right">
                      <button className="p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-3xl bg-slate-50 text-slate-300 border border-slate-100">
                        <Search size={40} className="stroke-[1.5]" />
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-lg">No proposals found</p>
                        <p className="text-slate-400 text-sm italic">Adjust your filters or start a new strategic proposal</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProposalModal open={isAddModalOpen} setOpen={setIsAddModalOpen} />
      {selectedProposal && (
        <EditProposalModal 
          open={isEditModalOpen} 
          setOpen={setIsEditModalOpen} 
          proposal={selectedProposal} 
        />
      )}
    </div>
  );
}

'use client';

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase, Users, FileText,
  ArrowUpRight, CheckCircle, Clock, AlertCircle, Search
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useProposalStore } from '@/store/proposalStore';
import { useClientStore } from '@/store/clientStore';
import { useBillingStore } from '@/store/billingStore';
import { SUBCATEGORY_LABELS, CATEGORY_LABELS } from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

export default function DashboardPage() {
  const { assignments } = useAssignmentStore();
  const { proposals } = useProposalStore();
  const { clients } = useClientStore();
  const { invoices, fetchInvoices } = useBillingStore();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [dashboardTab, setDashboardTab] = React.useState<'revenue' | 'billing'>('revenue');

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const stats = useMemo(() => {
    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const totalFees = assignments.reduce((sum, a) => sum + (a.total_fees || 0), 0);
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.net_amount, 0);
    const pendingProposals = proposals.filter(p => p.status === 'pending').length;
    const wonProposals = proposals.filter(p => p.status === 'won').length;
    const billingPct = totalFees > 0 ? (totalBilled / totalFees) * 100 : 0;

    return { activeAssignments, totalFees, totalBilled, pendingProposals, wonProposals, billingPct, totalClients: clients.length };
  }, [assignments, proposals, clients, invoices]);

  const recentAssignments = useMemo(() => {
    return [...assignments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [assignments]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return assignments.slice(0, 5);
    return assignments.filter(a => 
      a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.proposal_number?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [assignments, searchTerm]);

  const recentProposals = useMemo(() => {
    return [...proposals]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [proposals]);

  const kpiCards = [
    {
      label: 'Active Assignments',
      value: stats.activeAssignments.toString(),
      icon: Briefcase,
      trend: `${assignments.length} total`,
      trendUp: true,
      color: 'emerald',
      accent: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/8',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Pending Proposals',
      value: stats.pendingProposals.toString(),
      icon: Clock,
      trend: `${stats.wonProposals} won`,
      trendUp: true,
      color: 'amber',
      accent: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/8',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Total Clients',
      value: stats.totalClients.toString(),
      icon: Users,
      trend: `${clients.length} registered`,
      trendUp: true,
      color: 'blue',
      accent: 'from-blue-600 to-indigo-600',
      bg: 'bg-blue-500/8',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Invoices',
      value: invoices.length.toString(),
      icon: FileText,
      trend: 'Finalized',
      trendUp: true,
      color: 'violet',
      accent: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-500/8',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle size={10} /> Active
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={10} /> Draft
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-600 border border-slate-300/40">
            <CheckCircle size={10} /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
            {status}
          </span>
        );
    }
  };

  const getProposalBadge = (status: string) => {
    switch (status) {
      case 'won':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={10} /> Won
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={10} /> Pending
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle size={10} /> Lost
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Overview of your practice management</p>
        </div>
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search active assignments, clients, or numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] bg-white border border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 outline-none transition-all font-medium text-slate-700 shadow-sm shadow-slate-200/50"
          />
          
          {/* Search Dropdown Overlay */}
          {isSearchFocused && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {searchTerm ? 'Search Results' : 'Recent Assignments'}
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((a) => (
                    <Link 
                      key={a.id} 
                      href={`/assignments/${a.id}`}
                      className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {a.proposal_number?.slice(-3) || 'AS'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{a.client_name}</div>
                        <div className="text-xs text-slate-500">{a.proposal_number || 'No Proposal #'}</div>
                      </div>
                      <div className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md uppercase">
                        {a.status}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 italic text-sm">
                    No matching assignments found.
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link href="/assignments" className="text-xs font-bold text-blue-600 hover:underline">
                  View all tactical assignments
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Revenue vs Billing Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="card p-0 overflow-hidden"
      >
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setDashboardTab('revenue')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              dashboardTab === 'revenue' 
                ? "border-blue-600 text-blue-600 bg-white" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Total Revenue
          </button>
          <button 
            onClick={() => setDashboardTab('billing')}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-2",
              dashboardTab === 'billing' 
                ? "border-blue-600 text-blue-600 bg-white" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Billing Progress
          </button>
        </div>
        
        <div className="p-6">
          {dashboardTab === 'revenue' ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimated Revenue</div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                  {formatIndianCurrency(stats.totalFees, true, true)}
                </div>
                <p className="text-sm text-slate-500 mt-2 max-w-md">
                  Aggregate value of all active and completed assignments based on total agreed fees.
                </p>
              </div>
              <div className="w-full md:w-64 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                  <div className="text-[10px] font-bold uppercase opacity-80 mb-1">Total Billed</div>
                  <div className="text-xl font-bold">{formatIndianCurrency(stats.totalBilled, true, true)}</div>
                </div>
                <TrendingUp size={80} className="absolute -bottom-4 -right-4 opacity-10" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Billing Achievement</div>
                  <div className="text-4xl font-black text-slate-900 tracking-tighter">
                    {stats.billingPct.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-700">{formatIndianCurrency(stats.totalBilled, true, true)}</div>
                  <div className="text-xs text-slate-400">out of {formatIndianCurrency(stats.totalFees, true, true)}</div>
                </div>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.billingPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600"
                />
              </div>
              <p className="text-xs text-slate-500 font-medium italic">
                * Percentages reflect total billed vs total agreed fees across all practice areas.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.1)] hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Gradient accent bar */}
            <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", card.accent)} />
            {/* Ambient glow */}
            <div className={cn("absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-[0.06]", card.iconBg.replace('/10', ''))} />

            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.iconBg)}>
                <card.icon size={20} className={card.iconColor} />
              </div>
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{card.value}</div>
            <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-semibold",
              card.trendUp ? "text-emerald-600" : "text-rose-500"
            )}>
              {card.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {card.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two-column grid: Recent Assignments + Recent Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Assignments</h2>
            <Link
              href="/assignments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100/80">
            {recentAssignments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">No assignments yet</div>
            ) : (
              recentAssignments.map((a) => (
                <Link key={a.id} href={`/assignments/${a.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors group/row">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover/row:text-blue-700 transition-colors">
                      {a.client_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {SUBCATEGORY_LABELS[a.subcategory]} • {a.fiscal_year}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className="text-sm font-bold text-slate-700">{formatIndianCurrency(a.total_fees || 0, true, true)}</span>
                    {getStatusBadge(a.status)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Proposals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Proposals</h2>
            <Link
              href="/proposals"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100/80">
            {recentProposals.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">No proposals yet</div>
            ) : (
              recentProposals.map((p) => (
                <Link key={p.id} href={`/proposals/${p.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors group/row">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover/row:text-blue-700 transition-colors">
                      {p.client_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {p.number} • {p.fiscal_year}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className="text-sm font-bold text-slate-700">{formatIndianCurrency(p.quotation_amount, true, true)}</span>
                    {getProposalBadge(p.status)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Won Proposals', value: stats.wonProposals, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Total Invoices', value: invoices.length, icon: FileText, color: 'text-violet-600', bg: 'bg-violet-500/10' },
          { label: 'Assignments', value: assignments.length, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-500/10' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", item.bg)}>
              <item.icon size={18} className={item.color} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-900">{item.value}</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

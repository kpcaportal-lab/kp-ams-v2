'use client';

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase, Users, FileText,
  ArrowUpRight, CheckCircle, Clock, AlertCircle, Search, Sparkles
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useProposalStore } from '@/store/proposalStore';
import { useClientStore } from '@/store/clientStore';
import { useBillingStore } from '@/store/billingStore';
import { useAuthStore } from '@/store/authStore';
import { SUBCATEGORY_LABELS } from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.215, 0.61, 0.355, 1] as const }
  })
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { assignments, fetchAssignments } = useAssignmentStore();
  const { proposals, fetchProposals } = useProposalStore();
  const { clients, fetchClients } = useClientStore();
  const { invoices, fetchInvoices } = useBillingStore();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [dashboardTab, setDashboardTab] = React.useState<'revenue' | 'billing'>('revenue');

  useEffect(() => {
    fetchInvoices();
    fetchAssignments();
    fetchProposals();
    fetchClients();
  }, [fetchInvoices, fetchAssignments, fetchProposals, fetchClients]);

  const stats = useMemo(() => {
    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const totalFees = assignments.reduce((sum, a) => sum + Number(a.total_fees || 0), 0);
    const totalBilled = assignments.reduce((sum, a) => sum + Number(a.billed_amount || 0), 0);
    const totalReceived = assignments.reduce((sum, a) => sum + Number(a.amount_receipt || 0), 0);
    const pendingProposals = proposals.filter(p => p.status === 'pending').length;
    const wonProposals = proposals.filter(p => p.status === 'won').length;
    const billingPct = totalFees > 0 ? (totalBilled / totalFees) * 100 : 0;
    const collectionPct = totalBilled > 0 ? (totalReceived / totalBilled) * 100 : 0;

    return {
      activeAssignments,
      totalFees,
      totalBilled,
      totalReceived,
      pendingProposals,
      wonProposals,
      billingPct,
      collectionPct,
      totalClients: clients.length
    };
  }, [assignments, proposals, clients]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return assignments.slice(0, 5);
    return assignments.filter(a =>
      a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.proposal_number?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [assignments, searchTerm]);

  const recentAssignments = useMemo(() => {
    return [...assignments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [assignments]);

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
      trend: `${assignments.length} Total`,
      trendVal: '+12%',
      accent: 'from-brand-navy to-brand-navy/80',
      iconColor: 'bg-brand-navy text-white',
    },
    {
      label: 'Opportunities',
      value: stats.pendingProposals.toString(),
      icon: Clock,
      trend: `${stats.wonProposals} Won`,
      trendVal: '+5%',
      accent: 'from-brand-red to-brand-red/80',
      iconColor: 'bg-brand-red text-white',
    },
    {
      label: 'Client Network',
      value: stats.totalClients.toString(),
      icon: Users,
      trend: `${clients.length} Active`,
      trendVal: '+8%',
      accent: 'from-brand-navy/90 to-brand-navy',
      iconColor: 'bg-brand-navy text-white',
    },
    {
      label: 'Financial achievement',
      value: formatIndianCurrency(stats.totalBilled, true, true),
      icon: FileText,
      trend: 'Settled',
      trendVal: '+15%',
      accent: 'bg-brand-navy',
      iconColor: 'bg-brand-navy text-white',
    },
  ];

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      active: 'bg-brand-navy/5 text-brand-navy border-brand-navy/20',
      draft: 'bg-brand-red/5 text-brand-red border-brand-red/20',
      completed: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    const config = configs[status] || 'bg-slate-50 text-slate-600 border-slate-100';
    return (
      <span className={cn("px-2.5 py-1 rounded-none text-[9px] font-extrabold uppercase tracking-widest border", config)}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner relative bg-white px-8 py-10 md:px-12 md:py-14 text-brand-navy overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-brand-navy text-white text-[9px] font-extrabold uppercase tracking-[0.2em] mb-4">
              KPCA Insight
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Welcome Back, <span className="text-brand-red">
                {user?.role === 'admin' ? 'Admin' : (user?.full_name?.split(' ')[0] || 'Partner')}
              </span>
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Practice performance is up <span className="text-brand-red font-extrabold">12.4%</span>. There are <span className="text-brand-navy font-extrabold">{stats.activeAssignments}</span> active assignments.
            </p>
          </div>

          <div className="relative w-full md:max-w-md">
            <div className="group relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-navy transition-colors" size={22} />
              <input
                type="text"
                placeholder="Query missions, partners, or docs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-14 pr-6 py-5 rounded-none bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-navy outline-none transition-all font-semibold text-brand-navy placeholder:text-slate-400 text-lg"
              />

              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 shadow-none rounded-none overflow-hidden z-[100]"
                  >
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-[0.2em]">Live Intel</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {searchResults.length > 0 ? (
                        searchResults.map((a) => (
                          <Link
                            key={a.id}
                            href={`/assignments/${a.id}`}
                            className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group"
                          >
                            <div className="w-12 h-12 rounded-none bg-slate-100 flex items-center justify-center font-extrabold text-brand-navy text-sm border border-slate-200">
                              {a.proposal_number?.slice(-2) || 'AS'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-brand-navy group-hover:text-brand-red transition-colors truncate">{a.client_name}</div>
                              <div className="text-xs text-slate-500 mt-1">{a.proposal_number || 'No Identifier'}</div>
                            </div>
                            {getStatusBadge(a.status)}
                          </Link>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                          <p className="text-slate-500 font-medium italic">No matches in current database.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Secondary KPI Cluster */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Clients', value: stats.totalClients, color: 'text-brand-navy', icon: Users },
          { label: 'Win Rate', value: `${((stats.wonProposals / (proposals.length || 1)) * 100).toFixed(0)}%`, color: 'text-emerald-600', icon: TrendingUp },
          { label: 'Total Assignments', value: assignments.length, color: 'text-brand-navy', icon: Briefcase },
          { label: 'Billing Health', value: 'Excellent', color: 'text-brand-red', icon: Sparkles },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4 bg-white border border-slate-200 rounded-none p-5 group hover:border-brand-navy transition-all">
            <div className={cn("w-10 h-10 rounded-none bg-slate-50 flex items-center justify-center transition-all group-hover:bg-brand-navy group-hover:text-white border border-slate-100", item.color)}>
              <item.icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">{item.value}</div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{item.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="group relative bg-white rounded-none p-7 border border-slate-200 hover:border-brand-navy transition-all duration-500 cursor-default overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn("w-14 h-14 rounded-none flex items-center justify-center border border-slate-200 transition-all duration-500", card.iconColor)}>
                <card.icon size={26} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">{card.label}</span>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tighter font-number">{card.value}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <span className="text-xs font-extrabold text-slate-500">{card.trend}</span>
              <span className="flex items-center gap-1 text-[10px] font-extrabold text-brand-navy bg-slate-50 px-2 py-0.5 rounded-none border border-slate-200 uppercase tracking-widest">
                <TrendingUp size={12} strokeWidth={3} /> {card.trendVal}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Stats Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 bg-white rounded-none border border-slate-200 overflow-hidden flex flex-col"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between px-10 py-10 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-accent">Financial Performance</h2>
              <p className="text-sm font-semibold text-slate-400 mt-1">Real-time revenue tracking & billing</p>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-none mt-4 md:mt-0 border border-slate-200">
              <button
                onClick={() => setDashboardTab('revenue')}
                className={cn(
                  "px-6 py-2 rounded-none text-xs font-extrabold transition-all duration-300 tracking-wider uppercase",
                  dashboardTab === 'revenue'
                    ? "bg-brand-navy text-white"
                    : "text-slate-500 hover:text-brand-navy"
                )}
              >
                Revenue
              </button>
              <button
                onClick={() => setDashboardTab('billing')}
                className={cn(
                  "px-6 py-2 rounded-none text-xs font-extrabold transition-all duration-300 tracking-wider uppercase",
                  dashboardTab === 'billing'
                    ? "bg-brand-navy text-white"
                    : "text-slate-500 hover:text-brand-navy"
                )}
              >
                Collections
              </button>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12">
            <AnimatePresence mode="wait">
              {dashboardTab === 'revenue' ? (
                <motion.div
                  key="revenue"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col md:flex-row items-center gap-12"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-extrabold text-brand-navy uppercase tracking-[0.3em] mb-4 block opacity-60">Estimated Gross Value</span>
                    <div className="text-6xl md:text-7xl font-extrabold text-slate-900 tracking-[-0.05em] mb-8 font-number">
                      {formatIndianCurrency(stats.totalFees, true, true)}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-extrabold text-slate-600 mb-10">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-slate-50 border border-slate-200 transition-colors">
                        <CheckCircle size={14} className="text-emerald-500" /> Professional Fees
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-slate-50 border border-slate-200 transition-colors">
                        <TrendingUp size={14} className="text-brand-navy" /> Active Missions
                      </div>
                    </div>
                    <p className="text-slate-400 font-medium max-w-lg leading-relaxed text-base italic border-l-2 border-slate-100 pl-6 py-1">
                      Total projected revenue from across all practice areas. Includes current active assignments and recently completed missions awaiting final closure.
                    </p>
                  </div>
                  <div className="w-full md:w-[26rem] p-8 rounded-none bg-brand-navy text-white relative overflow-hidden group border border-slate-800">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-brand-white text-[10px] font-extrabold uppercase tracking-[0.2em] mb-8">
                        <div className="w-2 h-2 bg-brand-white" /> Finalized Billing
                      </div>
                      <div className="text-4xl font-extrabold mb-3 tracking-tighter font-number whitespace-nowrap">{formatIndianCurrency(stats.totalBilled, true, true)}</div>
                      <div className="text-xs font-bold text-slate-400 mb-10 tracking-wide">Net billing achievement</div>
                      <Link href="/billing" className="inline-flex items-center gap-2.5 px-6 py-3 bg-brand-red !text-white border border-brand-red hover:bg-white hover:text-brand-red transition-all duration-300 text-xs font-extrabold uppercase">
                        Financial Audit <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <span className="text-xs font-extrabold text-brand-navy uppercase tracking-[0.2em] mb-3 block">Billing Efficiency</span>
                      <div className="text-6xl font-extrabold text-slate-900 tracking-tighter font-number">
                        {stats.billingPct.toFixed(1)}%
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-none overflow-hidden mt-4 border border-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.billingPct}%` }}
                          className="h-full bg-brand-navy"
                        />
                      </div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Billed: {formatIndianCurrency(stats.totalBilled, true, true)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-brand-red uppercase tracking-[0.2em] mb-3 block">Collection Efficiency</span>
                      <div className="text-6xl font-extrabold text-slate-900 tracking-tighter font-number">
                        {stats.collectionPct.toFixed(1)}%
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-none overflow-hidden mt-4 border border-slate-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.collectionPct}%` }}
                          className="h-full bg-brand-red"
                        />
                      </div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Received: {formatIndianCurrency(stats.totalReceived, true, true)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                    <div className="p-5 rounded-none bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Portfolio</div>
                      <div className="text-lg font-extrabold text-slate-800 font-number">{formatIndianCurrency(stats.totalFees, true, true)}</div>
                    </div>
                    <div className="p-5 rounded-none bg-brand-navy/5 border border-brand-navy/10">
                      <div className="text-[10px] font-extrabold text-brand-navy uppercase tracking-widest mb-1">Total Invoiced</div>
                      <div className="text-lg font-extrabold text-brand-navy font-number">{formatIndianCurrency(stats.totalBilled, true, true)}</div>
                    </div>
                    <div className="p-5 rounded-none bg-brand-red/5 border border-brand-red/10">
                      <div className="text-[10px] font-extrabold text-brand-red uppercase tracking-widest mb-1">Total Received</div>
                      <div className="text-lg font-extrabold text-brand-red font-number">{formatIndianCurrency(stats.totalReceived, true, true)}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sidebar Mini-Lists */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-none border border-slate-200 p-8 group"
          >
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-6">Quick Tasks</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Register New Client', href: '/clients', icon: '/files/corporate.svg', color: 'hover:bg-slate-50' },
                { label: 'Draft New Proposal', href: '/proposals', icon: '/files/process.svg', color: 'hover:bg-slate-50' },
                { label: 'Execute Assignment', href: '/assignments', icon: '/files/audit.svg', color: 'hover:bg-slate-50' },
                { label: 'Generate Invoice', href: '/billing', icon: '/files/finance.svg', color: 'hover:bg-slate-50' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn("flex items-center gap-4 p-4 rounded-none border border-slate-100 transition-all duration-300 font-bold text-sm text-slate-700 hover:border-brand-navy", item.color)}
                >
                  <div className="w-10 h-10 rounded-none bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors border border-slate-100">
                    <img src={item.icon} alt="" className="w-full h-full object-contain" />
                  </div>
                  {item.label}
                  <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-navy" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Billing Reminders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-none border border-slate-200 p-8 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <DollarSign size={80} className="text-brand-navy" />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <AlertCircle className="text-brand-red" size={20} strokeWidth={2.5} />
                Billing Reminders
              </h3>
              <div className="space-y-4">
                {assignments.filter(a => Number(a.total_fees) > Number(a.billed_amount)).slice(0, 3).map((a) => (
                  <div key={a.id} className="p-4 rounded-none bg-slate-50 border border-slate-100 hover:border-brand-red/30 transition-colors group/item">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-slate-800 truncate pr-2 group-hover/item:text-brand-navy transition-colors" title={a.client_name}>
                        {a.client_name}
                      </div>
                      <span className="text-[10px] font-extrabold text-brand-red bg-white px-2 py-0.5 rounded-none border border-brand-red/10">
                        Pending
                      </span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-xs text-slate-500 font-medium">
                        Unbilled: <span className="font-extrabold text-slate-700 font-number">{formatIndianCurrency(Number(a.total_fees) - Number(a.billed_amount), true, true)}</span>
                      </div>
                      <Link href="/billing" className="text-[10px] font-extrabold text-brand-navy hover:text-brand-red transition-colors flex items-center gap-0.5 uppercase tracking-wider">
                        Invoiced <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  </div>
                ))}
                {assignments.filter(a => Number(a.total_fees) > Number(a.billed_amount)).length === 0 && (
                  <div className="text-center py-6 text-slate-400 font-medium italic text-sm">
                    No pending billing windows.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Mission Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-none border border-slate-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Feed</h3>
              <Link href="/assignments" className="text-xs font-extrabold text-brand-navy hover:text-brand-red transition-colors uppercase tracking-widest">Full Database</Link>
            </div>
            <div className="space-y-6">
              {recentAssignments.map((a) => (
                <Link key={a.id} href={`/assignments/${a.id}`} className="flex gap-4 group cursor-pointer">
                  <div className="w-1.5 h-12 bg-slate-100 rounded-none group-hover:bg-brand-red transition-all group-hover:w-2" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-800 group-hover:text-brand-navy transition-colors truncate">{a.client_name}</div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                      {SUBCATEGORY_LABELS[a.subcategory] || a.subcategory || '—'}
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 self-center tabular-nums font-number">
                    {formatIndianCurrency(Number(a.total_fees || 0), true, true)}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}

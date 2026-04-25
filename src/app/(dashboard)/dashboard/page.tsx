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
    const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.net_amount || 0), 0);
    const pendingProposals = proposals.filter(p => p.status === 'pending').length;
    const wonProposals = proposals.filter(p => p.status === 'won').length;
    const billingPct = totalFees > 0 ? (totalBilled / totalFees) * 100 : 0;

    return { activeAssignments, totalFees, totalBilled, pendingProposals, wonProposals, billingPct, totalClients: clients.length };
  }, [assignments, proposals, clients, invoices]);

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
      label: 'Active Missions',
      value: stats.activeAssignments.toString(),
      icon: Briefcase,
      trend: `${assignments.length} Total`,
      trendVal: '+12%',
      accent: 'from-blue-600 to-indigo-600',
      iconColor: 'bg-blue-600 text-white',
    },
    {
      label: 'Opportunities',
      value: stats.pendingProposals.toString(),
      icon: Clock,
      trend: `${stats.wonProposals} Won`,
      trendVal: '+5%',
      accent: 'from-amber-400 to-orange-500',
      iconColor: 'bg-amber-500 text-white',
    },
    {
      label: 'Partner Network',
      value: stats.totalClients.toString(),
      icon: Users,
      trend: `${clients.length} Active`,
      trendVal: '+8%',
      accent: 'from-emerald-500 to-teal-600',
      iconColor: 'bg-emerald-500 text-white',
    },
    {
      label: 'Financial Flow',
      value: invoices.length.toString(),
      icon: FileText,
      trend: 'Settled',
      trendVal: '+15%',
      accent: 'from-violet-500 to-fuchsia-600',
      iconColor: 'bg-violet-600 text-white',
    },
  ];

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      active: 'bg-blue-50 text-blue-600 border-blue-100',
      draft: 'bg-amber-50 text-amber-600 border-amber-100',
      completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
    const config = configs[status] || 'bg-slate-50 text-slate-600 border-slate-100';
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", config)}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-8 py-10 md:px-12 md:py-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-[0.2em] mb-4">
              <Sparkles size={14} /> Intelligence Overview
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{user?.full_name?.split(' ')[0] || 'Partner'}</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Your practice performance is up <span className="text-emerald-400 font-bold">12.4%</span> this quarter. You have <span className="text-white font-bold">{stats.activeAssignments}</span> active assignments requiring attention.
            </p>
          </div>
          
          <div className="relative w-full md:max-w-md">
            <div className="group relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={22} />
              <input
                type="text"
                placeholder="Query missions, partners, or docs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold text-white placeholder:text-slate-500 text-lg backdrop-blur-md"
              />
              
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-[100] backdrop-blur-xl"
                  >
                    <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Live Intel</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {searchResults.length > 0 ? (
                        searchResults.map((a) => (
                          <Link 
                            key={a.id} 
                            href={`/assignments/${a.id}`}
                            className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center font-black text-blue-400 text-sm group-hover:scale-110 transition-transform">
                              {a.proposal_number?.slice(-2) || 'AS'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{a.client_name}</div>
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

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="group relative bg-white rounded-[2rem] p-7 border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-2 cursor-default overflow-hidden"
          >
            {/* Hover Background Accent */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500", card.accent)} />
            
            <div className="flex items-center justify-between mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500", card.iconColor)}>
                <card.icon size={26} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.label}</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{card.value}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-500">{card.trend}</span>
              <span className="flex items-center gap-1 text-[11px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp size={12} /> {card.trendVal}
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
          className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-8 border-b border-slate-100 bg-slate-50/30">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Financial Performance</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">Real-time revenue tracking & billing</p>
            </div>
            <div className="flex p-1.5 bg-slate-200/50 rounded-2xl mt-4 md:mt-0">
              <button 
                onClick={() => setDashboardTab('revenue')}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  dashboardTab === 'revenue' 
                    ? "bg-white text-blue-600 shadow-xl" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Revenue
              </button>
              <button 
                onClick={() => setDashboardTab('billing')}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  dashboardTab === 'billing' 
                    ? "bg-white text-blue-600 shadow-xl" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Billing
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-8 md:p-12">
            <AnimatePresence mode="wait">
              {dashboardTab === 'revenue' ? (
                <motion.div 
                  key="revenue"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  className="flex flex-col md:flex-row items-center gap-12"
                >
                  <div className="flex-1">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">Estimated Gross Value</span>
                    <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
                      {formatIndianCurrency(stats.totalFees, true, true)}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-8">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                        <CheckCircle size={16} className="text-emerald-500" /> Professional Fees
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                        <TrendingUp size={16} className="text-blue-500" /> Active Missions
                      </div>
                    </div>
                    <p className="text-slate-400 font-medium max-w-lg leading-relaxed text-base">
                      Total projected revenue from across all practice areas. Includes current active assignments and recently completed missions awaiting final closure.
                    </p>
                  </div>
                  <div className="w-full md:w-80 p-8 rounded-[2rem] bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-blue-200 text-[10px] font-black uppercase tracking-widest mb-6">
                        <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" /> Finalized Billing
                      </div>
                      <div className="text-3xl font-black mb-2">{formatIndianCurrency(stats.totalBilled, true, true)}</div>
                      <div className="text-xs font-bold text-blue-200/80 mb-8">Net billing achievement</div>
                      <Link href="/billing" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-black transition-all">
                        Financial Audit <ArrowUpRight size={14} />
                      </Link>
                    </div>
                    <TrendingUp size={120} className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="billing"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  className="space-y-10"
                >
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 block">Billing Status</span>
                      <div className="text-6xl font-black text-slate-900 tracking-tighter">
                        {stats.billingPct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-2xl font-black text-slate-800">{formatIndianCurrency(stats.totalBilled, true, true)}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Invoiced to date</div>
                    </div>
                  </div>
                  
                  <div className="relative pt-2">
                    <div className="w-full h-8 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 p-1.5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.billingPct}%` }}
                        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                        className="h-full rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 shadow-xl relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[pulse_2s_linear_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Scope</div>
                      <div className="text-lg font-black text-slate-800">{formatIndianCurrency(stats.totalFees, true, true)}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Billed Net</div>
                      <div className="text-lg font-black text-indigo-600">{formatIndianCurrency(stats.totalBilled, true, true)}</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-rose-50/30 border border-rose-100">
                      <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Outstanding</div>
                      <div className="text-lg font-black text-rose-600">{formatIndianCurrency(stats.totalFees - stats.totalBilled, true, true)}</div>
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
            className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm group"
          >
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Quick Tasks</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Register New Client', href: '/clients', icon: Users, color: 'hover:bg-blue-50' },
                { label: 'Draft New Proposal', href: '/proposals', icon: FileText, color: 'hover:bg-indigo-50' },
                { label: 'Execute Assignment', href: '/assignments', icon: Briefcase, color: 'hover:bg-emerald-50' },
                { label: 'Generate Invoice', href: '/billing', icon: DollarSign, color: 'hover:bg-violet-50' },
              ].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={cn("flex items-center gap-4 p-4 rounded-2xl border border-slate-100 transition-all duration-300 font-bold text-sm text-slate-700 hover:border-blue-200 hover:shadow-lg", item.color)}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:text-current group-hover:bg-white transition-colors shadow-sm">
                    <item.icon size={18} />
                  </div>
                  {item.label}
                  <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Mission Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Feed</h3>
              <Link href="/assignments" className="text-xs font-black text-blue-600 hover:underline">Full Database</Link>
            </div>
            <div className="space-y-6">
              {recentAssignments.map((a) => (
                <Link key={a.id} href={`/assignments/${a.id}`} className="flex gap-4 group cursor-pointer">
                  <div className="w-1.5 h-12 bg-slate-100 rounded-full group-hover:bg-blue-600 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">{a.client_name}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {SUBCATEGORY_LABELS[a.subcategory]}
                    </div>
                  </div>
                  <div className="text-xs font-black text-slate-900 self-center">
                    {formatIndianCurrency(a.total_fees || 0, true, true)}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer KPI Cluster */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Clients', value: stats.totalClients, color: 'text-blue-500', icon: Users },
          { label: 'Win Rate', value: `${((stats.wonProposals / (proposals.length || 1)) * 100).toFixed(0)}%`, color: 'text-emerald-500', icon: TrendingUp },
          { label: 'Total Volume', value: assignments.length, color: 'text-violet-500', icon: Briefcase },
          { label: 'Billing Health', value: 'Excellent', color: 'text-amber-500', icon: Sparkles },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-[1.5rem] p-5 shadow-sm border border-slate-200 group hover:border-white transition-all">
            <div className={cn("w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
              <item.icon size={20} />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">{item.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

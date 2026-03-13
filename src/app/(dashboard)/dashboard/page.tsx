'use client';

import React, { useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase, Users, FileText,
  ArrowUpRight, CheckCircle, Clock, AlertCircle
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

  const recentProposals = useMemo(() => {
    return [...proposals]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [proposals]);

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatIndianCurrency(stats.totalFees, true, true),
      icon: DollarSign,
      trend: '+12.3%',
      trendUp: true,
      color: 'blue',
      accent: 'from-blue-600 to-indigo-600',
      bg: 'bg-blue-500/8',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
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
      label: 'Billing Progress',
      value: `${stats.billingPct.toFixed(1)}%`,
      icon: TrendingUp,
      trend: formatIndianCurrency(stats.totalBilled, true, true) + ' billed',
      trendUp: stats.billingPct > 30,
      color: 'violet',
      accent: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-500/8',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600',
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">Overview of your practice management</p>
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

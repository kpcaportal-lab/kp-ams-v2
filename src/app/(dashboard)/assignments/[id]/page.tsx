'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Briefcase, Calendar, Users, DollarSign, FileText,
  CheckCircle, Clock, Edit2, AlertCircle, TrendingUp
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useBillingStore } from '@/store/billingStore';
import {
  SUBCATEGORY_LABELS, CATEGORY_LABELS, BILLING_CYCLE_LABELS,
  FISCAL_MONTHS, formatDate, formatCurrency
} from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { assignments } = useAssignmentStore();
  const { invoices } = useBillingStore();

  const assignment = assignments.find(a => a.id === id);
  const assignmentInvoices = invoices.filter(inv => inv.assignment_id === id);

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Briefcase size={48} className="text-slate-300" />
        <p className="text-lg font-semibold text-slate-500">Assignment not found</p>
        <button onClick={() => router.push('/assignments')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          Back to Assignments
        </button>
      </div>
    );
  }

  const totalBilled = assignmentInvoices.reduce((sum, inv) => sum + inv.net_amount, 0);
  const billingPct = assignment.total_fees > 0 ? (totalBilled / assignment.total_fees) * 100 : 0;

  const statusBadge = (() => {
    switch (assignment.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle size={13} /> Active
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={13} /> Draft
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <CheckCircle size={13} /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
            {assignment.status}
          </span>
        );
    }
  })();

  // Build fee allocation progress from store data
  const allocations = assignment.allocations || [];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button onClick={() => router.push('/assignments')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Assignments
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{assignment.client_name}</h1>
            <p className="text-sm text-slate-400 mt-0.5 font-medium">
              {assignment.scope_item || SUBCATEGORY_LABELS[assignment.subcategory]} • {assignment.fiscal_year}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge}
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Edit2 size={14} /> Edit
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fees', value: formatIndianCurrency(assignment.total_fees), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-500/10', accent: 'from-blue-600 to-indigo-600' },
          { label: 'Billed', value: formatIndianCurrency(totalBilled), icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-500/10', accent: 'from-emerald-500 to-teal-500' },
          { label: 'Billing %', value: `${billingPct.toFixed(1)}%`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-500/10', accent: 'from-violet-500 to-purple-600' },
          { label: 'Invoices', value: assignmentInvoices.length.toString(), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-500/10', accent: 'from-amber-500 to-orange-500' },
        ].map((card, i) => (
          <div key={card.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", card.accent)} />
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.bg)}>
                <card.icon size={18} className={card.color} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900">{card.value}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Two-column: Details + Billing Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Assignment Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Category', value: `${assignment.category} — ${CATEGORY_LABELS[assignment.category]}` },
              { label: 'Subcategory', value: SUBCATEGORY_LABELS[assignment.subcategory] },
              { label: 'Billing Cycle', value: BILLING_CYCLE_LABELS[assignment.billing_cycle] },
              { label: 'Partner', value: assignment.partner_name || '—' },
              { label: 'Manager', value: assignment.manager_name || '—' },
              { label: 'Fiscal Year', value: assignment.fiscal_year },
              { label: 'Proposal', value: assignment.proposal_number || '—', isLink: !!assignment.proposal_id, href: `/proposals/${assignment.proposal_id}` },
              { label: 'Start Date', value: assignment.start_date ? formatDate(assignment.start_date) : '—' },
              { label: 'End Date', value: assignment.end_date ? formatDate(assignment.end_date) : '—' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{row.label}</span>
                {row.isLink && row.href ? (
                  <Link href={row.href} className="text-sm font-semibold text-blue-600 hover:underline font-mono text-xs">{row.value}</Link>
                ) : (
                  <span className="text-sm font-semibold text-slate-800">{row.value}</span>
                )}
              </div>
            ))}
          </div>
          {assignment.notes && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-slate-600 leading-relaxed">{assignment.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Billing Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Billing Progress</h3>
          {/* Overall Progress Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Overall Progress</span>
              <span className="text-sm font-bold text-slate-900">{billingPct.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(billingPct, 100)}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className={cn("h-full rounded-full",
                  billingPct >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                  billingPct >= 40 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                  "bg-gradient-to-r from-amber-400 to-orange-400"
                )}
              />
            </div>
          </div>
          {/* Monthly Allocations */}
          {allocations.length > 0 ? (
            <div className="space-y-2">
              {allocations.map((alloc) => {
                const pct = alloc.amount > 0 ? (alloc.billed_amount / alloc.amount) * 100 : 0;
                return (
                  <div key={alloc.id} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 w-12 shrink-0">{FISCAL_MONTHS[alloc.month - 1]?.slice(0, 3)}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 w-16 text-right">
                      {formatIndianCurrency(alloc.billed_amount, true, true)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No fee allocations defined</p>
          )}
        </motion.div>
      </div>

      {/* Invoices Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-blue-600" /> Invoices
          </h2>
          <span className="text-xs font-semibold text-slate-400">{assignmentInvoices.length} total</span>
        </div>
        {assignmentInvoices.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <FileText size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No invoices generated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-200/60">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Narration</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prof. Fees</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">OOP</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {assignmentInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3 text-slate-600">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{inv.narration}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatIndianCurrency(inv.professional_fees)}</td>
                    <td className="px-5 py-3 text-right text-slate-600">{formatIndianCurrency(inv.out_of_pocket)}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">{formatIndianCurrency(inv.net_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Change History */}
      {assignment.history && assignment.history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Change History</h3>
          <div className="space-y-3">
            {assignment.history.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-700">{entry.field_name}</span>
                    {entry.old_value && (
                      <span className="text-xs text-slate-400 line-through">{entry.old_value}</span>
                    )}
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-xs font-semibold text-blue-600">{entry.new_value}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {entry.changed_by_name || 'System'} • {formatDate(entry.changed_at)}
                    {entry.reason && ` — ${entry.reason}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

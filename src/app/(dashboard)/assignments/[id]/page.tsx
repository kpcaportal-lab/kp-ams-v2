'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, FileText, CheckCircle2, Clock, Pencil, Trash2, ChevronRight, PieChart, Briefcase, IndianRupee, Layout, MoreVertical, Search, Filter, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useBillingStore } from '@/store/billingStore';
import {
  SUBCATEGORY_LABELS, CATEGORY_LABELS, BILLING_CYCLE_LABELS,
  FISCAL_MONTHS, formatDate, formatCurrency,
  AssignmentCategory, AssignmentSubcategory, BillingCycle
} from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import EditAssignmentModal from '@/components/modals/EditAssignmentModal';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { assignments, fetchAssignmentById, isLoading } = useAssignmentStore();
  const { invoices, fetchInvoices } = useBillingStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchAssignmentById(id as string).then(data => {
        if (data) setCurrentAssignment(data);
      });
    }
    fetchInvoices();
  }, [id, fetchAssignmentById, fetchInvoices]);

  const assignment = currentAssignment || assignments.find(a => a.id === id);
  const assignmentInvoices = invoices.filter(inv => inv.assignment_id === id);

  if (isLoading && !assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-navy border-t-transparent rounded-none animate-spin" />
        <p className="text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">Gathering intelligence...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Briefcase size={48} className="text-slate-300" />
        <p className="text-lg font-semibold text-slate-500">Assignment not found</p>
        <button onClick={() => router.push('/assignments')}
          className="px-6 py-3 rounded-none bg-brand-navy text-white text-[10px] font-extrabold uppercase tracking-widest shadow-none hover:bg-slate-900 transition-colors">
          Back to Assignments
        </button>
      </div>
    );
  }

  const totalBilled = Number(assignment.billed_amount || 0);
  const totalFeesVal = Number(assignment.total_fees || 0);
  const billingPct = totalFeesVal > 0 ? (totalBilled / totalFeesVal) * 100 : 0;


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
              {assignment.scope_item || (assignment.subcategory && SUBCATEGORY_LABELS[assignment.subcategory as AssignmentSubcategory])} • {assignment.fiscal_year}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-none border border-slate-200 text-[10px] font-extrabold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest"
            >
              <Pencil size={18} />
              Edit Assignment
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fees', value: formatIndianCurrency(Number(assignment.total_fees || 0)), icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-500/10', accent: 'from-blue-600 to-indigo-600' },
          { label: 'Billed', value: formatIndianCurrency(Number(assignment.billed_amount || 0)), icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-500/10', accent: 'from-emerald-500 to-teal-500' },
          { label: 'Out of Pocket', value: formatIndianCurrency(Number(assignment.out_of_pocket || 0)), icon: PieChart, color: 'text-amber-600', bg: 'bg-amber-500/10', accent: 'from-amber-500 to-orange-500' },
          { label: 'Billing %', value: `${billingPct.toFixed(1)}%`, icon: PieChart, color: 'text-violet-600', bg: 'bg-violet-500/10', accent: 'from-violet-500 to-purple-600' },
        ].map((card, i) => (
          <div key={card.label}
            className="relative overflow-hidden rounded-none border border-slate-200 bg-white p-4 shadow-none">
            <div className={cn("absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r", card.accent)} />
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-none flex items-center justify-center", card.bg)}>
                <card.icon size={18} className={card.color} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums">{card.value}</div>
                <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Two-column: Details + Billing Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
          className="rounded-none border border-slate-200 bg-white p-5 shadow-none">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Mission Parameters</h3>
          <div className="space-y-3">
            {[
              { label: 'Category', value: `${assignment.category} — ${CATEGORY_LABELS[assignment.category as AssignmentCategory]}` },
              { label: 'Subcategory', value: SUBCATEGORY_LABELS[assignment.subcategory as AssignmentSubcategory] },
              { label: 'Billing Cycle', value: BILLING_CYCLE_LABELS[assignment.billing_cycle as BillingCycle] },
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
                  <Link href={row.href} className="text-[10px] font-extrabold text-brand-navy hover:text-brand-red transition-colors uppercase tracking-wider">{row.value}</Link>
                ) : (
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">{row.value}</span>
                )}
              </div>
            ))}
          </div>
          {assignment.notes && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Confidential Notes</p>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">{assignment.notes}</p>
            </div>
          )}
        </motion.div>

        {/* Billing Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="rounded-none border border-slate-200 bg-white p-5 shadow-none">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Settlement Trajectory</h3>
          {/* Overall Progress Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Aggregate Progress</span>
              <span className="text-sm font-extrabold text-slate-900 tabular-nums">{billingPct.toFixed(1)}%</span>
            </div>
            <div className="h-4 rounded-none bg-slate-100 overflow-hidden border border-slate-200 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(billingPct, 100)}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className={cn("h-full rounded-none",
                  billingPct >= 80 ? "bg-emerald-500" :
                    billingPct >= 40 ? "bg-brand-navy" :
                      "bg-brand-red"
                )}
              />
            </div>
          </div>
          {/* Monthly Allocations */}
          {allocations.length > 0 ? (
            <div className="space-y-2">
              {allocations.map((alloc: any) => {
                const pct = alloc.amount > 0 ? (alloc.billed_amount / alloc.amount) * 100 : 0;
                return (
                  <div key={alloc.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold text-slate-400 w-12 shrink-0 uppercase">{FISCAL_MONTHS[alloc.month - 1]?.slice(0, 3)}</span>
                    <div className="flex-1 h-2 rounded-none bg-slate-100 overflow-hidden border border-slate-200">
                      <div className="h-full rounded-none bg-brand-navy" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-900 w-16 text-right tabular-nums">
                      {formatIndianCurrency(alloc.billed_amount, true)}
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
        className="rounded-none border border-slate-200 bg-white shadow-none overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-[10px] font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-widest">
            <FileText size={16} className="text-brand-navy" /> Strategic Invoices
          </h2>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{assignmentInvoices.length} total</span>
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
                <tr className="bg-brand-navy border-b border-white/5">
                  <th className="text-left px-5 py-3 text-[9px] font-extrabold text-white uppercase tracking-[0.2em]">Transaction Date</th>
                  <th className="text-left px-5 py-3 text-[9px] font-extrabold text-white uppercase tracking-[0.2em]">Narration</th>
                  <th className="text-right px-5 py-3 text-[9px] font-extrabold text-white uppercase tracking-[0.2em]">Prof. Fees</th>
                  <th className="text-right px-5 py-3 text-[9px] font-extrabold text-white uppercase tracking-[0.2em]">OOP</th>
                  <th className="text-right px-5 py-3 text-[9px] font-extrabold text-white uppercase tracking-[0.2em]">Net Amount</th>
                  <th className="text-right px-5 py-3 text-[9px] font-extrabold text-white uppercase tracking-[0.2em]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {assignmentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-brand-navy/[0.02] transition-colors group">
                    <td className="px-5 py-3 text-slate-600 text-xs font-bold tabular-nums">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3 font-extrabold text-slate-800 text-xs uppercase tracking-tight">{inv.narration}</td>
                    <td className="px-5 py-3 text-right text-slate-600 text-xs font-extrabold tabular-nums">{formatIndianCurrency(inv.professional_fees)}</td>
                    <td className="px-5 py-3 text-right text-slate-600 text-xs font-extrabold tabular-nums">{formatIndianCurrency(inv.out_of_pocket)}</td>
                    <td className="px-5 py-3 text-right font-extrabold text-slate-900 text-xs tabular-nums">{formatIndianCurrency(inv.net_amount)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/invoices/${inv.id}/download`, {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem('kp_token')}`
                              }
                            });
                            if (!res.ok) throw new Error('Download failed');
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `Invoice_${inv.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            toast.error('Failed to download invoice');
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-brand-navy hover:bg-slate-50 rounded-none transition-all"
                        title="Download Invoice"
                      >
                        <Download size={14} strokeWidth={3} />
                      </button>
                    </td>
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
          className="rounded-none border border-slate-200 bg-white p-5 shadow-none">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Audit Trail</h3>
          <div className="space-y-3">
            {assignment.history.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-1.5 h-1.5 rounded-none bg-brand-navy mt-1.5 shrink-0" />
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
      {/* Task Creation Modal */}
      {/* <AddTaskModal open={isTaskModalOpen} setOpen={setIsTaskModalOpen} /> */}

      {/* Edit Assignment Modal */}
      <EditAssignmentModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        assignment={assignment}
      />
    </div>
  );
}

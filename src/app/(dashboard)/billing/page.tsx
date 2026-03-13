'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, DollarSign, FileText, TrendingUp, Download } from 'lucide-react';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { formatDate } from '@/types';
import { AddInvoiceModal } from '@/components/billing/AddInvoiceModal';
import { InvoiceDownloadButton } from '@/components/billing/InvoiceDownloadButton';
import { type Invoice, type Assignment } from '@/types';
import { useBillingStore } from '@/store/billingStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

export default function BillingPage() {
  const { invoices, loading, fetchInvoices } = useBillingStore();
  const { assignments } = useAssignmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.udin?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [invoices, searchTerm]);

  const stats = useMemo(() => {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.net_amount, 0);
    const totalProfFees = invoices.reduce((sum, inv) => sum + inv.professional_fees, 0);
    const totalOOP = invoices.reduce((sum, inv) => sum + inv.out_of_pocket, 0);
    const totalFees = assignments.reduce((sum, a) => sum + (a.total_fees || 0), 0);
    const billingPct = totalFees > 0 ? (totalBilled / totalFees) * 100 : 0;
    return { totalBilled, totalProfFees, totalOOP, billingPct, count: invoices.length };
  }, [invoices, assignments]);

  const kpiCards = [
    { label: 'Total Billed', value: formatIndianCurrency(stats.totalBilled, true, true), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-500/10', accent: 'from-blue-600 to-indigo-600' },
    { label: 'Prof. Fees', value: formatIndianCurrency(stats.totalProfFees, true, true), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/10', accent: 'from-emerald-500 to-teal-500' },
    { label: 'Out of Pocket', value: formatIndianCurrency(stats.totalOOP, true, true), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-500/10', accent: 'from-amber-500 to-orange-500' },
    { label: 'Invoices', value: stats.count.toString(), icon: FileText, color: 'text-violet-600', bg: 'bg-violet-500/10', accent: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Track all invoices and billing progress</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Plus size={18} />
          Generate Invoice
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
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

      {/* Billing Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">Overall Billing Progress</h3>
          <span className="text-sm font-extrabold text-slate-900">{stats.billingPct.toFixed(1)}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(stats.billingPct, 100)}%` }}
            transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
            className={cn("h-full rounded-full",
              stats.billingPct >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
              stats.billingPct >= 40 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
              "bg-gradient-to-r from-amber-400 to-orange-400"
            )}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>{formatIndianCurrency(stats.totalBilled, true, true)} billed</span>
          <span>{formatIndianCurrency(assignments.reduce((s, a) => s + (a.total_fees || 0), 0), true, true)} total fees</span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search client, narration, UDIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-500">No invoices found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-b from-slate-50 to-slate-100/80 border-b border-slate-200/60">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Narration</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prof. Fees</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">OOP</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Amount</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">UDIN</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredInvoices.map((inv, i) => (
                  <motion.tr key={inv.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                    className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{inv.client_name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate">{inv.narration}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{formatIndianCurrency(inv.professional_fees)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{formatIndianCurrency(inv.out_of_pocket)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatIndianCurrency(inv.net_amount)}</td>
                    <td className="px-5 py-3.5">
                      {inv.udin ? (
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{inv.udin}</span>
                      ) : (
                         <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <InvoiceDownloadButton invoice={inv} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      <AddInvoiceModal open={isModalOpen} setOpen={setIsModalOpen} />
    </div>
  );
}

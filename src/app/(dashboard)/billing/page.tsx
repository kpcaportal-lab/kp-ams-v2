'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, DollarSign, FileText, TrendingUp, Download, 
  Users, Filter, Activity, Receipt, CreditCard, ChevronLeft, ChevronRight, Clock 
} from 'lucide-react';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { formatDate, type DashboardSummary, type Invoice } from '@/types';
import { AddInvoiceModal } from '@/components/billing/AddInvoiceModal';
import { InvoiceDownloadButton } from '@/components/billing/InvoiceDownloadButton';
import { useAuthStore } from '@/store/authStore';
import { useBillingStore } from '@/store/billingStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import * as XLSX from 'xlsx';


export type TabId = 'invoices' | 'breakdown';

interface BreakdownItem {
  id: string;
  full_name: string;
  display_name?: string;
  role: 'partner' | 'manager';
  billed: number;
  billing_pct?: number;
}

export default function BillingPage() {
  const { invoices, loading: billingLoading, fetchInvoices } = useBillingStore();
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('invoices');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headers = useMemo(() => ({ 
    Authorization: `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  }), [token]);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch billing summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchSummary();
  }, [fetchInvoices, fetchSummary]);

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const search = searchTerm.toLowerCase();
        return (
          inv.client_name?.toLowerCase().includes(search) ||
          inv.narration.toLowerCase().includes(search) ||
          inv.udin?.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());
  }, [invoices, searchTerm]);

  const handleExport = () => {
    const exportData = filteredInvoices.map(inv => ({
      'Date': formatDate(inv.invoice_date),
      'Client Name': inv.client_name,
      'Professional Fees': Number(inv.professional_fees || 0),
      'Net Amount': Number(inv.net_amount || 0),
      'UDIN': inv.udin || '—',
      'Narration': inv.narration,
      'Assignment ID': inv.assignment_id
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, `KP_AMS_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
  };


  const filteredBreakdown = useMemo((): BreakdownItem[] => {
    if (!summary) return [];
    const search = searchTerm.toLowerCase();
    const combined: BreakdownItem[] = [
      ...(summary.partnerBreakdown || []).map(p => ({ ...p, role: 'partner' as const })),
      ...(summary.managerBreakdown || []).map(m => ({ ...m, role: 'manager' as const, billed: m.billed_amount, billing_pct: m.billing_pct }))
    ];
    return combined.filter(u => 
      u.full_name.toLowerCase().includes(search) || 
      (u.display_name && u.display_name.toLowerCase().includes(search))
    );
  }, [summary, searchTerm]);

  interface Tab {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ size: number }>;
  }

  // Tab configurations matching Admin page
  const tabs: Tab[] = [
    { id: 'invoices', label: 'All Invoices', icon: Receipt },
    { id: 'breakdown', label: 'Revenue Breakdown', icon: Users },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm font-accent">
            Billing <span className="text-brand-gold">& Revenue</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Unified financial oversight and performance tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-black transition-all hover:bg-slate-50 shadow-sm active:scale-95"
          >
            <Download size={18} strokeWidth={3} className="text-emerald-500" />
            Export Registry
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy text-white text-sm font-black shadow-[0_10px_20px_rgba(30,58,95,0.15)] hover:shadow-[0_15px_30px_rgba(30,58,95,0.25)] transition-all border border-slate-800"
          >
            <Plus size={18} strokeWidth={3} className="text-brand-gold" />
            Generate Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Billed', value: Number(summary?.totalBilled || 0), icon: DollarSign, color: 'text-brand-navy', bg: 'bg-brand-navy/5' },
          { label: 'Overdue Revenue', value: Number(summary?.overdue || 0), icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Collection %', value: `${Number(summary?.billingPct || 0).toFixed(1)}%`, isRaw: true, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Invoices', value: Number(invoices.length || 0), isRaw: true, icon: FileText, color: 'text-brand-gold', bg: 'bg-brand-gold/5' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group p-6 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition-all flex items-center gap-5 hover:-translate-y-1"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", kpi.bg, kpi.color)}>
               <kpi.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {kpi.label}
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
                {kpi.isRaw ? kpi.value : formatIndianCurrency(Number(kpi.value || 0), true, true)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-slate-100 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all",
              activeTab === tab.id ? "bg-brand-navy/5 text-brand-navy" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <tab.icon size={18} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" />
        <input
          type="text"
          placeholder={activeTab === 'invoices' ? "Search client, UDIN or reference..." : "Search manager or partner performance..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold/30 transition-all"
        />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'invoices' && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Particulars</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Prof. Fees</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Amount</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">UDIN</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading || billingLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-8">
                          <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : filteredInvoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      className="hover:bg-brand-navy/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-5 text-sm font-bold text-slate-500">{formatDate(inv.invoice_date)}</td>
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-900 group-hover:text-brand-navy transition-colors">{inv.client_name}</div>
                        <div className="text-xs font-medium text-slate-400 mt-0.5 line-clamp-1 italic">{inv.narration}</div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">{formatIndianCurrency(inv.professional_fees)}</td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-100 shadow-sm">
                          {formatIndianCurrency(Number(inv.net_amount || 0))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         {inv.udin ? (
                           <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200 uppercase tracking-tighter">{inv.udin}</span>
                         ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <InvoiceDownloadButton invoice={inv} />
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <Activity className="text-slate-200" size={48} strokeWidth={1} />
                           <p className="text-slate-400 font-bold italic">No invoices found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'breakdown' && (
          <motion.div
            key="breakdown"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredBreakdown.map((item) => (
              <div 
                key={item.id}
                className="group p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-[0_20px_40px_rgba(30,58,95,0.08)] transition-all flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                      {item.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-lg tracking-tight font-accent">
                        {item.full_name}
                      </div>
                      <div className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">{item.role}</div>
                    </div>
                  </div>
                  {item.full_name === 'Hamza Momin' && (
                    <div className="px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold font-black text-[9px] uppercase tracking-widest border border-brand-gold/20 animate-pulse">
                      Principal
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-2xl font-black text-brand-navy tabular-nums">
                      {formatIndianCurrency(Number(item.billed || 0), true, true)}
                    </div>
                  </div>
                  {item.role === 'manager' && item.billing_pct !== undefined && (
                    <div className="text-right">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Achievement</div>
                       <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                             <div className="h-full bg-brand-gold" style={{ width: `${Math.min(item.billing_pct, 100)}%` }} />
                          </div>
                          <span className="font-black text-brand-gold text-xs italic">{Number(item.billing_pct || 0).toFixed(0)}%</span>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredBreakdown.length === 0 && (
              <div className="col-span-full p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                 <p className="text-slate-400 font-black italic">No revenue attribution data available</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddInvoiceModal open={isModalOpen} setOpen={setIsModalOpen} />
    </div>
  );
}

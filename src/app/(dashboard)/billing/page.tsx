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


export default function BillingPage() {
  const { invoices, loading: billingLoading, fetchInvoices } = useBillingStore();
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'invoices' | 'breakdown'>('invoices');
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


  const filteredBreakdown = useMemo(() => {
    if (!summary) return [];
    const search = searchTerm.toLowerCase();
    const combined = [
      ...(summary.partnerBreakdown || []).map(p => ({ ...p, role: 'partner' })),
      ...(summary.managerBreakdown || []).map(m => ({ ...m, role: 'manager', billed: m.billed_amount }))
    ];
    return combined.filter(u => 
      u.full_name.toLowerCase().includes(search) || 
      (u.display_name && u.display_name.toLowerCase().includes(search))
    );
  }, [summary, searchTerm]);

  // Tab configurations matching Admin page
  const tabs = [
    { id: 'invoices', label: 'All Invoices', icon: Receipt },
    { id: 'breakdown', label: 'Revenue Breakdown', icon: Users },
  ];

  return (
    <div style={{ padding: '0 8px' }}>
      {/* Page Header - Admin Standard */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Billing & Revenue
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Unified billing interface and performance tracking
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: '#fff', color: 'var(--text-primary)', border: '1px solid var(--border)',
              borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
          >
            <Download size={18} className="text-emerald-500" />
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: 'var(--gradient-primary)', color: '#fff', border: 'none',
              borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: '0 4px 12px var(--color-primary-ring)', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} />
            Generate Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards - Matching Dashboard/Admin hybrid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Billed', value: Number(summary?.totalBilled || 0), icon: DollarSign, color: '#3b82f6', bg: 'var(--bg-primary-light)' },
          { label: 'Overdue Revenue', value: Number(summary?.overdue || 0), icon: Clock, color: '#ef4444', bg: 'var(--bg-danger-light)' },
          { label: 'Collection %', value: `${Number(summary?.billingPct || 0).toFixed(1)}%`, isRaw: true, icon: TrendingUp, color: '#10b981', bg: 'var(--bg-success-light)' },
          { label: 'Active Invoices', value: Number(invoices.length || 0), isRaw: true, icon: FileText, color: '#8b5cf6', bg: 'var(--color-violet-light)' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              padding: '20px 24px', background: '#fff', border: '1px solid var(--border)',
              borderRadius: 16, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 16
            }}
          >
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, background: kpi.bg, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
            }}>
               <kpi.icon size={22} style={{ color: kpi.color, margin: 'auto' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {kpi.isRaw ? kpi.value : formatIndianCurrency(Number(kpi.value || 0), true, true)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs Switcher - Exactly as in Admin area */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              borderRadius: 10, border: 'none', background: activeTab === tab.id ? 'var(--bg-primary-light)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-muted)',
              cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar - Integrated Style */}
      <div style={{ marginBottom: 24, position: 'relative', maxWidth: 400 }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={activeTab === 'invoices' ? "Search client, UDIN..." : "Search manager or partner..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12,
            border: '1px solid var(--border)', background: '#fff', fontSize: '0.9rem',
            outline: 'none', transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
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
            style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Professional Fees</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Amount</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>UDIN</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading || billingLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td colSpan={6} style={{ padding: '24px 20px' }}>
                          <div style={{ height: 20, background: 'var(--bg-main)', borderRadius: 4, width: '100%', animation: 'pulse 1.5s infinite' }} />
                        </td>
                      </tr>
                    ))
                  ) : filteredInvoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatDate(inv.invoice_date)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{inv.client_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.narration}</div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 600 }}>{formatIndianCurrency(inv.professional_fees)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ background: 'var(--bg-primary-light)', color: 'var(--color-primary)', display: 'inline-block', padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem' }}>
                          {formatIndianCurrency(Number(inv.net_amount || 0))}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                         {inv.udin ? (
                           <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569' }}>{inv.udin}</span>
                         ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <InvoiceDownloadButton invoice={inv} />
                      </td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No invoices matching your search criteria
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
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}
          >
            {filteredBreakdown.map((item) => (
              <div 
                key={item.id}
                style={{
                  padding: '20px 24px', background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-card)', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 12, background: 'var(--bg-main)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                    color: 'var(--text-secondary)', fontSize: '0.9rem'
                  }}>
                    <span style={{ margin: 'auto' }}>{item.full_name.charAt(0)}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {item.full_name}
                      {item.full_name === 'Hamza Momin' && (
                        <span style={{ marginLeft: 8, fontSize: '0.65rem', background: 'var(--bg-success-light)', color: 'var(--color-success)', padding: '2px 6px', borderRadius: 6, verticalAlign: 'middle' }}>
                          PRIORITY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.role}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '6px 12px', borderRadius: 10, background: 'var(--bg-primary-light)',
                      color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.9rem'
                    }}>
                      {formatIndianCurrency(Number(item.billed || 0), true, true)}
                    </div>
                    {item.role === 'manager' && (item as any).billing_pct !== undefined && (
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 4, textAlign: 'center' }}>
                        {Number((item as any).billing_pct || 0).toFixed(0)}% of target
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredBreakdown.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', background: '#fff', border: '1px dashed var(--border)', borderRadius: 16, color: 'var(--text-muted)' }}>
                No revenue data found for the current filter
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddInvoiceModal open={isModalOpen} setOpen={setIsModalOpen} />
    </div>
  );
}

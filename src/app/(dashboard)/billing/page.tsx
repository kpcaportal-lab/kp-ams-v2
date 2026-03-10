'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, FileText, CheckCircle, Clock, Download, Mail } from 'lucide-react';
import { useBillingStore } from '@/store/billingStore';
import { formatCurrency, formatDate } from '@/types';

export default function BillingPage() {
  const { invoices } = useBillingStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.narration.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.email_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'sent':
        return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Sent</span>;
      case 'pending':
        return <span className="badge badge-warning" style={{ backgroundColor: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Pending</span>;
      case 'failed':
        return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Failed</span>;
      default:
        return <span className="badge">Draft</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyItems: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Billing & Invoices</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage invoices, billing cycles, and payment tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Batch Generate
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Total Invoiced (MTD)</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(271400)}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.5rem', fontWeight: 500 }}>+12% vs last month</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Pending Drafts</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>5</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Needs review</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Outstanding Amount</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatCurrency(88500)}</p>
          <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.5rem', fontWeight: 500 }}>2 invoices overdue</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Average Collection Time</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>18 days</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.5rem', fontWeight: 500 }}>-2 days YoY</p>
        </div>
      </div>

      {/* Filters/Search */}
      <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search invoices by client or narration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', minWidth: 150 }}
        >
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="pending">Pending</option>
        </select>
        
        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textIndent: 0, borderColor: 'inherit', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Invoice Details</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Client & Subledger</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Amount</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Send Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <FileText size={16} color="var(--color-primary)" /> {invoice.id.toUpperCase()}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {formatDate(invoice.invoice_date)}
                      </div>
                      {invoice.udin && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          UDIN: {invoice.udin}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{invoice.client_name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{invoice.new_sales_ledger}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{formatCurrency(invoice.net_amount)}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fees: {formatCurrency(invoice.professional_fees)}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(invoice.email_status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--text-secondary)' }} title="Send Email">
                          <Mail size={16} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--text-secondary)' }} title="Download PDF">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No invoices found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, Eye, Edit, Calendar } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, formatCurrency } from '@/types';

export default function AssignmentListPage() {
  const { assignments } = useAssignmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.manager_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'completed':
        return <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>Completed</span>;
      case 'draft':
        return <span className="badge badge-warning" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>Draft</span>;
      case 'postponed':
        return <span className="badge badge-danger">Postponed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Assignments</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Overview of all client assignments and engagements</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New Assignment
        </button>
      </div>

      {/* Filters/Search */}
      <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search assignments by client, partner or manager..."
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
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
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
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Client & Assignment</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Category</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Team</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Fees & Billing</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/assignments/${assignment.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'block', marginBottom: '0.25rem' }}>
                        {assignment.client_name}
                      </Link>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={12} /> {assignment.fiscal_year}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{SUBCATEGORY_LABELS[assignment.subcategory]}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cat {assignment.category}: {CATEGORY_LABELS[assignment.category]}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>P: {assignment.partner_name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>M: {assignment.manager_name}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{formatCurrency(assignment.total_fees)}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{assignment.billing_cycle}</p>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(assignment.status)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }} className="hover:text-primary">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No assignments found matching your search.
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

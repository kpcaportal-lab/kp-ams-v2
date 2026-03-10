'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/assignmentStore';
import { ArrowLeft, Building, Mail, Phone, Calendar, MoreVertical, Edit, FileText, CheckCircle, Clock } from 'lucide-react';
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, formatCurrency } from '@/types';

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { assignments } = useAssignmentStore();
  
  const assignment = assignments.find(a => a.id === params.id);
  const [activeTab, setActiveTab] = useState('overview');

  if (!assignment) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Assignment not found</h2>
        <button className="btn btn-secondary" onClick={() => router.push('/assignments')}>Back to Assignments</button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'financials', label: 'Financials' },
    { id: 'workpapers', label: 'Workpapers' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button 
          onClick={() => router.push('/assignments')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {assignment.client_name} - {SUBCATEGORY_LABELS[assignment.subcategory]}
            </h2>
            <span className={`badge ${assignment.status === 'active' ? 'badge-success' : ''}`} style={
              assignment.status === 'completed' ? { backgroundColor: '#e2e8f0', color: '#475569' } : 
              assignment.status === 'draft' ? { backgroundColor: '#fef3c7', color: '#b45309' } : {}
            }>
              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Calendar size={14} /> Fiscal Year: {assignment.fiscal_year} • Category: {CATEGORY_LABELS[assignment.category]}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit size={16} /> Edit
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 0',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Key Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Fees</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(assignment.total_fees)}</p>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Billing Cycle</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'capitalize' }}>{assignment.billing_cycle.replace('_', ' ')}</p>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Progress</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '45%', height: '100%', background: 'var(--color-primary)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>45%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Timeline & Stages</h3>
                <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Update Progress</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '2rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={16} />
                    </div>
                    <div style={{ width: '2px', flex: 1, background: '#e2e8f0', margin: '0.25rem 0' }}></div>
                  </div>
                  <div style={{ paddingBottom: '1rem', flex: 1 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>Planning Phase</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Kickoff meeting completed. Information Request List shared with client.</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Completed on {new Date(assignment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '2rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={16} />
                    </div>
                    <div style={{ width: '2px', flex: 1, background: '#e2e8f0', margin: '0.25rem 0' }}></div>
                  </div>
                  <div style={{ paddingBottom: '1rem', flex: 1 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>Fieldwork</h4>
                    <span className="badge badge-warning" style={{ marginTop: '0.25rem', marginBottom: '0.5rem', display: 'inline-block' }}>In Progress</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Vouching and verification of Q1 & Q2 transactions.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '2rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#e2e8f0', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem', color: '#94a3b8' }}>Reporting</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>Pending Fieldwork completion.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Assignment Team
                <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>Manage</button>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Engagement Partner</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                      {assignment.partner_name?.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{assignment.partner_name}</span>
                  </div>
                </div>
                
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', marginTop: '0.5rem' }}>Manager</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                      {assignment.manager_name?.charAt(0)}
                    </div>
                    <div>
                      <span style={{ fontWeight: 500, display: 'block' }}>{assignment.manager_name}</span>
                      {assignment.manager_email && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{assignment.manager_email}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GSTN</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{assignment.gstn}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Start Date</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>End Date</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Proposal ID</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-primary)' }}>{assignment.proposal_id || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>{tabTitle(activeTab)} Tab Area</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>This section is under construction.</p>
        </div>
      )}

    </div>
  );
}

function tabTitle(id: string) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

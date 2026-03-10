'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClientStore } from '@/store/clientStore';
import { ArrowLeft, Building, Mail, Phone, Calendar, MoreVertical, Edit, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { clients } = useClientStore();
  
  const client = clients.find(c => c.id === params.id);
  const [activeTab, setActiveTab] = useState('overview');

  if (!client) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Client not found</h2>
        <button className="btn btn-secondary" onClick={() => router.push('/clients')}>Back to Clients</button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button 
          onClick={() => router.push('/clients')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{client.name}</h2>
            <span className={`badge ${client.status === 'active' ? 'badge-success' : ''}`} style={client.status === 'inactive' ? { backgroundColor: '#e2e8f0', color: '#475569' } : {}}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Building size={14} /> {client.industry}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit size={16} /> Edit Client
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> New Assignment
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Recent Assignments</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg-card-hover)' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Statutory Audit FY23-24</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Partner: Sneha P. • Manager: Anand K.</p>
                  </div>
                  <span className="badge badge-warning">In Progress</span>
                </div>
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Tax Advisory - Q2</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Partner: Rahul K. • Manager: Priya R.</p>
                  </div>
                  <span className="badge badge-success">Completed</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Key Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Revenue</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹2.4M</p>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Ongoing Assignments</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>1</p>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Proposals Sent</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Primary Contact
                <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>Edit</button>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>{client.spocName}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Director of Finance</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Mail size={16} />
                  <a href={`mailto:${client.spocEmail}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{client.spocEmail}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Phone size={16} />
                  <span>{client.spocPhone}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Client ID</span>
                  <span style={{ fontWeight: 500 }}>{client.id.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Industry</span>
                  <span style={{ fontWeight: 500 }}>{client.industry}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Added On</span>
                  <span style={{ fontWeight: 500 }}>{new Date(client.createdAt).toLocaleDateString()}</span>
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

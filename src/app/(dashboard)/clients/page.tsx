'use client';

import React, { useState } from 'react';
import { useClientStore } from '@/store/clientStore';
import { useRouter } from 'next/navigation';
import { Search, Plus, MoreVertical, Edit, FileText, Trash2 } from 'lucide-react';
import type { Client } from '@/types';

// Simple Add Client Modal (inline for simplicity in this prototype)
function AddClientModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (c: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void 
}) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    status: 'active' as 'active' | 'inactive',
    spocName: '',
    spocEmail: '',
    spocPhone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    // Reset
    setFormData({ name: '', industry: '', status: 'active', spocName: '', spocEmail: '', spocPhone: '' });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 500, padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Client</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Client Name</label>
            <input required type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label className="label">Industry</label>
            <input required type="text" className="input" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="e.g. Manufacturing" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">SPOC Name</label>
              <input required type="text" className="input" value={formData.spocName} onChange={e => setFormData({...formData, spocName: e.target.value})} placeholder="John Doe" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">SPOC Email</label>
              <input required type="email" className="input" value={formData.spocEmail} onChange={e => setFormData({...formData, spocEmail: e.target.value})} placeholder="john@acme.com" />
            </div>
            <div>
              <label className="label">SPOC Phone</label>
              <input required type="text" className="input" value={formData.spocPhone} onChange={e => setFormData({...formData, spocPhone: e.target.value})} placeholder="+91..." />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { clients, addClient } = useClientStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter clients
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Clients</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage client profiles and their contacts.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={18} />
            </div>
            <input 
              type="text" 
              className="input" 
              placeholder="Search clients..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Client
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', minWidth: 800 }}>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Industry</th>
                <th>SPOC</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: 80, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} onClick={(e) => {
                  // Only navigate if clicking on the row, not the action buttons
                  const target = e.target as HTMLElement;
                  if (!target.closest('button')) {
                    router.push(`/clients/${client.id}`);
                  }
                }} style={{ cursor: 'pointer' }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{client.industry}</td>
                  <td>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{client.spocName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{client.spocEmail}</div>
                  </td>
                  <td>
                    <span className={`badge ${client.status === 'active' ? 'badge-success' : ''}`} style={client.status === 'inactive' ? { backgroundColor: '#e2e8f0', color: '#475569' } : {}}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem', background: 'transparent' }} onClick={() => router.push(`/clients/${client.id}`)} title="View Details">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No clients found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addClient} 
      />
    </div>
  );
}

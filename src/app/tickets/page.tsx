'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useTicketStore } from '@/store/ticketStore';
import { formatDistanceToNow } from 'date-fns';
import { Plus, X } from 'lucide-react';

export default function TicketsPage() {
    const { tickets, isLoading, fetchTickets, createTicket } = useTicketStore();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createTicket({ title, description, priority });
            setCreateModalOpen(false);
            setTitle('');
            setDescription('');
            setPriority('low');
        } catch (error) {
            console.error('Failed to create ticket', error);
        } finally {
            setCreating(false);
        }
    };

    const getPriorityColor = (p: string) => {
        if (p === 'low') return 'var(--color-success)';
        if (p === 'medium') return 'var(--color-warning)';
        return 'var(--color-danger)';
    };

    const getStatusColor = (s: string) => {
        if (s === 'open') return 'var(--color-primary)';
        if (s === 'in_progress') return 'var(--color-warning)';
        if (s === 'resolved') return 'var(--color-success)';
        return 'var(--text-muted)'; // closed
    };

    return (
        <div style={{ padding: '24px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                        Support Tickets
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>View and manage your support requests.</p>
                </div>
                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="btn-primary"
                    style={{ gap: '8px' }}
                >
                    <Plus size={18} />
                    New Ticket
                </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Submitted By</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && tickets.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading tickets...</td>
                            </tr>
                        ) : tickets.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No tickets found. Create one to get started!
                                </td>
                            </tr>
                        ) : (
                            tickets.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                                    <td>{t.submitted_by_name || '-'}</td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                            background: `color-mix(in srgb, ${getPriorityColor(t.priority)} 15%, transparent)`,
                                            color: getPriorityColor(t.priority),
                                            textTransform: 'uppercase'
                                        }}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                            background: `color-mix(in srgb, ${getStatusColor(t.status)} 15%, transparent)`,
                                            color: getStatusColor(t.status),
                                            textTransform: 'uppercase'
                                        }}>
                                            {t.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
                        <div style={{ 
                            padding: '20px 24px', 
                            borderBottom: '1px solid var(--border-default)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Create New Ticket</h2>
                            <button 
                                onClick={() => setCreateModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label className="form-label">Issue Title</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Brief summary of the issue"
                                    required 
                                    maxLength={100}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label className="form-label">Priority</label>
                                <select 
                                    className="input" 
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="input" 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detailed explanation of what you need help with..."
                                    required 
                                    rows={5}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: '20px', margin: '0 -24px -24px -24px', paddingBottom: '24px', paddingRight: '24px' }}>
                                <button 
                                    type="button" 
                                    className="btn-secondary" 
                                    onClick={() => setCreateModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary"
                                    disabled={creating}
                                >
                                    {creating ? 'Creating...' : 'Create Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

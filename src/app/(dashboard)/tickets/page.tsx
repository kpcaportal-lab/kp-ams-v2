'use client';

import React, { useEffect, useState, useMemo, FormEvent } from 'react';
import { useTicketStore } from '@/store/ticketStore';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Plus, X, LifeBuoy, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import LoadingScreen from '@/components/ui/LoadingScreen';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

export default function TicketsPage() {
    const { tickets, isLoading, fetchTickets, createTicket } = useTicketStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [attachment, setAttachment] = useState<string | null>(null);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const filteredTickets = useMemo(() => {
        return tickets.filter((t) => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   t.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [tickets, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
            resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
        };
    }, [tickets]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB
                alert('Image must be smaller than 2MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Only image files are allowed');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createTicket({ title, description, priority, attachment_url: attachment || undefined });
            setCreateModalOpen(false);
            setTitle('');
            setDescription('');
            setPriority('low');
            setAttachment(null);
        } catch (error) {
            console.error('Failed to create ticket', error);
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateStatus = async (ticketId: string, status: string) => {
        try {
            await useTicketStore.getState().updateTicketStatus(ticketId, status);
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status });
            }
        } catch (error) {
            console.error('Failed to update ticket status', error);
        }
    };

    const getPriorityBadge = (p: string) => {
        if (p === 'high') {
            return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">High</span>;
        }
        if (p === 'medium') {
            return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">Medium</span>;
        }
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">Low</span>;
    };

    const getStatusBadge = (s: string) => {
        if (s === 'open') {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tight"><AlertCircle size={12}/> Open</span>;
        }
        if (s === 'in_progress') {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tight"><Clock size={12}/> In Progress</span>;
        }
        if (s === 'resolved') {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tight"><CheckCircle size={12}/> Resolved</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200 uppercase tracking-tight">Closed</span>;
    };

    if (isLoading && tickets.length === 0) return <LoadingScreen message="Loading support tickets..." />;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <LifeBuoy className="text-blue-600" size={28} />
                        Support Desk
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage and track your technical support requests.</p>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-[0_8px_16px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_20px_rgba(15,23,42,0.2)] hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus size={18} /> New Ticket
                </button>
            </motion.div>

            {/* KPI Strip */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <LifeBuoy size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">{stats.total}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total Tickets</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                            <AlertCircle size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">{stats.open}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Open & Working</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <CheckCircle size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">{stats.resolved}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Resolved</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search tickets by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm min-w-[160px] cursor-pointer appearance-none"
                >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
            </motion.div>

            {/* Tickets List */}
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                {filteredTickets.length === 0 ? (
                    <div className="px-8 py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <LifeBuoy size={28} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Tickets Found</h3>
                        <p className="text-sm text-slate-500 mt-1">There are no tickets matching your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left px-8 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Issue Details</th>
                                    <th className="text-left px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Priority</th>
                                    <th className="text-left px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Submitted By</th>
                                    <th className="text-left px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Created</th>
                                    <th className="text-right px-8 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTickets.map((t, i) => (
                                    <motion.tr 
                                        key={t.id} 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        transition={{ delay: i * 0.02 }}
                                        onClick={() => setSelectedTicket(t)}
                                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-8 py-5 max-w-sm">
                                            <div className="font-bold text-slate-900 text-[15px] group-hover:text-blue-600 transition-colors truncate">{t.title}</div>
                                            <div className="text-xs font-medium text-slate-500 mt-1 truncate">{t.description}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getPriorityBadge(t.priority)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-semibold text-slate-700">{t.submitted_by_name || 'System Generated'}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[13px] font-medium text-slate-500">
                                                {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {getStatusBadge(t.status)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCreateModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Support Ticket</h2>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Report an issue or request assistance</p>
                                </div>
                                <button
                                    onClick={() => setCreateModalOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-5">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Issue Title</label>
                                        <input 
                                            type="text" 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Brief summary of the issue"
                                            required 
                                            maxLength={100}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Priority</label>
                                        <select 
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value as any)}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all cursor-pointer appearance-none"
                                        >
                                            <option value="low">Low - General query or minor issue</option>
                                            <option value="medium">Medium - Core functionality impaired</option>
                                            <option value="high">High - Critical system failure</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Detailed explanation of what you need help with..."
                                            required 
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-300 resize-none"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Attachment (Image)</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="ticket-file"
                                            />
                                            <label 
                                                htmlFor="ticket-file"
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer transition-colors border border-slate-200 border-dashed"
                                            >
                                                {attachment ? 'Change Image' : 'Select Image'}
                                            </label>
                                            {attachment && (
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                                                    <img src={attachment} alt="Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => setAttachment(null)}
                                                        className="absolute top-0 right-0 bg-rose-500 text-white p-0.5"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCreateModalOpen(false)}
                                        className="flex-1 px-6 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_28px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {creating ? 'Creating...' : 'Submit Ticket'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ticket Details Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTicket(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <LifeBuoy size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ticket Details</h2>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">#{selectedTicket.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[70vh]">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="text-2xl font-black text-slate-900 leading-tight">{selectedTicket.title}</div>
                                            <div className="flex items-center gap-3 mt-2">
                                                {getStatusBadge(selectedTicket.status)}
                                                {getPriorityBadge(selectedTicket.priority)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Submitted By</div>
                                            <div className="text-sm font-bold text-slate-900">{selectedTicket.submitted_by_name || 'System'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Created Date</div>
                                            <div className="text-sm font-bold text-slate-900">{new Date(selectedTicket.created_at).toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</div>
                                        <div className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            {selectedTicket.description}
                                        </div>
                                    </div>

                                    {selectedTicket.attachment_url && (
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Attached Image</div>
                                            <div className="rounded-2xl overflow-hidden border border-slate-200">
                                                <img src={selectedTicket.attachment_url} alt="Attachment" className="w-full h-auto max-h-96 object-contain bg-slate-50" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Actions */}
                                    {(useAuthStore.getState().user?.role === 'admin' || useAuthStore.getState().user?.role === 'partner' || useAuthStore.getState().user?.role === 'director') && (
                                        <div className="pt-6 border-t border-slate-100 space-y-3">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Update Status (Admin Only)</div>
                                            <div className="flex gap-2">
                                                {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleUpdateStatus(selectedTicket.id, status)}
                                                        className={cn(
                                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                                            selectedTicket.status === status
                                                                ? "bg-slate-900 text-white border-slate-900"
                                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                                        )}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Close View
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

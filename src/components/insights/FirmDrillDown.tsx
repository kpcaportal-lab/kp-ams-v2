'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { X, Search, Loader2, ChevronLeft, ChevronRight, Users, FileText, Briefcase, IndianRupee, Wallet, BarChart3 } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import { billingPercent, billingPercentColor } from '@/utils/billingPercent';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ManagerOption {
    id: string;
    full_name: string;
    display_name: string;
}

interface FirmDrillDownProps {
    activeCard: string | null;
    managers: ManagerOption[];
    fiscalYear: string;
    onClose: () => void;
}

const CARD_CONFIG: Record<string, { label: string; icon: any; endpoint?: string }> = {
    clients: { label: 'All Clients', icon: Users, endpoint: '/api/insights/firm/clients' },
    proposals: { label: 'All Proposals', icon: FileText, endpoint: '/api/insights/firm/proposals' },
    assignments: { label: 'All Assignments', icon: Briefcase, endpoint: '/api/insights/firm/assignments' },
    billed: { label: 'Billing Breakdown', icon: IndianRupee },
    budget: { label: 'Budget Breakdown', icon: Wallet },
    billing: { label: 'Billing Efficiency', icon: BarChart3 },
};

export default function FirmDrillDown({ activeCard, managers, fiscalYear, onClose }: FirmDrillDownProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterManager, setFilterManager] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const config = activeCard ? CARD_CONFIG[activeCard] : null;

    // Filter managers list to only manager role
    const managerOptions = managers.filter(m => true); // all passed managers are already filtered by page.tsx

    const fetchData = useCallback(async () => {
        if (!activeCard || !config?.endpoint) return;
        setLoading(true);
        try {
            const res = await api.get(config.endpoint, {
                params: {
                    fiscal_year: fiscalYear,
                    manager_id: filterManager || undefined,
                    search,
                    page,
                    limit
                }
            });
            setData(res.data.data);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Drill-down fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [activeCard, config?.endpoint, fiscalYear, filterManager, search, page]);

    useEffect(() => {
        if (config?.endpoint) {
            fetchData();
        }
    }, [fetchData]);

    // Reset state when card changes
    useEffect(() => {
        setSearch('');
        setFilterManager('');
        setPage(1);
    }, [activeCard]);

    if (!activeCard || !config) return null;

    const totalPages = Math.ceil(total / limit);

    // For billed/budget/billing — use manager summary data passed in
    const isManagerView = ['billed', 'budget', 'billing'].includes(activeCard);

    // Filter + sort manager data for billed/budget/billing cards
    const getManagerViewData = () => {
        let filtered = [...managers];
        if (filterManager) {
            filtered = filtered.filter(m => m.id === filterManager);
        }
        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(m => (m.display_name || m.full_name).toLowerCase().includes(s));
        }
        return filtered;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-12 overflow-hidden"
            >
                <div className="bg-white border border-slate-200 rounded-none" style={{ borderTop: '3px solid var(--kp-navy, var(--brand-navy))' }}>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <config.icon size={18} className="text-[var(--brand-navy)]" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{config.label}</h3>
                            {!isManagerView && (
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-200">
                                    {total} record{total !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search */}
                            <div className="relative group">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search..."
                                    className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-none text-sm font-medium focus:border-[var(--brand-navy)] outline-none w-48 transition-all"
                                />
                            </div>
                            {/* Manager Filter */}
                            <select
                                value={filterManager}
                                onChange={(e) => { setFilterManager(e.target.value); setPage(1); }}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-none text-sm font-bold text-slate-700 focus:border-[var(--brand-navy)] outline-none cursor-pointer"
                            >
                                <option value="">All Managers</option>
                                {managerOptions.map(m => (
                                    <option key={m.id} value={m.id}>{m.display_name || m.full_name}</option>
                                ))}
                            </select>
                            {/* Close */}
                            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 transition-colors" title="Close">
                                <X size={16} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        {isManagerView ? (
                            <ManagerBreakdownTable data={getManagerViewData()} sortKey={activeCard} />
                        ) : activeCard === 'clients' ? (
                            <ClientsTable data={data} loading={loading} />
                        ) : activeCard === 'proposals' ? (
                            <ProposalsTable data={data} loading={loading} />
                        ) : activeCard === 'assignments' ? (
                            <AssignmentsTable data={data} loading={loading} />
                        ) : null}
                    </div>

                    {/* Pagination — only for API-fetched data */}
                    {!isManagerView && totalPages > 1 && (
                        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400">
                                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <span className="text-xs font-black text-slate-500 px-2">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ── Sub-tables ────────────────────────────────────────────────────

function LoadingRow({ cols }: { cols: number }) {
    return (
        <tr>
            <td colSpan={cols} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={28} className="text-[var(--brand-navy)] animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Data</p>
                </div>
            </td>
        </tr>
    );
}

function EmptyRow({ cols, text }: { cols: number; text: string }) {
    return (
        <tr>
            <td colSpan={cols} className="px-6 py-16 text-center text-sm font-medium text-slate-400">{text}</td>
        </tr>
    );
}

const thClass = "px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider font-accent";
const tdClass = "px-6 py-3.5 text-sm";

function ClientsTable({ data, loading }: { data: any[]; loading: boolean }) {
    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[var(--navy-50)]/50 border-b border-slate-200">
                    <th className={thClass}>Client Name</th>
                    <th className={thClass}>Manager</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Onboarded</th>
                    <th className={cn(thClass, 'text-right')}>Billed Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {loading ? <LoadingRow cols={5} /> : data.length === 0 ? <EmptyRow cols={5} text="No clients found." /> : data.map((c: any, idx: number) => (
                    <tr key={c.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className={cn(tdClass, 'font-bold text-slate-900')}>{c.name}</td>
                        <td className={cn(tdClass, 'font-medium text-slate-600')}>{c.manager_name}</td>
                        <td className={tdClass}>
                            <span className={cn("inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                c.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"
                            )}>{c.status}</span>
                        </td>
                        <td className={cn(tdClass, 'font-medium text-slate-600')}>{c.onboarded_date ? format(new Date(c.onboarded_date), 'dd MMM yyyy') : 'N/A'}</td>
                        <td className={cn(tdClass, 'text-right font-black text-slate-900')}>{formatINR(Number(c.billed_amount || 0))}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function ProposalsTable({ data, loading }: { data: any[]; loading: boolean }) {
    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[var(--navy-50)]/50 border-b border-slate-200">
                    <th className={thClass}>Proposal ID</th>
                    <th className={thClass}>Client</th>
                    <th className={thClass}>Manager</th>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Status</th>
                    <th className={cn(thClass, 'text-right')}>Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {loading ? <LoadingRow cols={6} /> : data.length === 0 ? <EmptyRow cols={6} text="No proposals found." /> : data.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className={cn(tdClass, 'font-bold text-slate-900')}>#{p.proposal_id}</td>
                        <td className={cn(tdClass, 'font-medium text-slate-700')}>{p.client_name}</td>
                        <td className={cn(tdClass, 'font-medium text-slate-600')}>{p.manager_name}</td>
                        <td className={cn(tdClass, 'font-medium text-slate-600')}>{p.date_sent ? format(new Date(p.date_sent), 'dd MMM yyyy') : 'N/A'}</td>
                        <td className={tdClass}>
                            <span className={cn("inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                p.status === 'won' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                p.status === 'lost' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                "bg-amber-50 text-amber-700 border-amber-100"
                            )}>{p.status}</span>
                        </td>
                        <td className={cn(tdClass, 'text-right font-black text-slate-900')}>{formatINR(Number(p.amount || 0))}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function AssignmentsTable({ data, loading }: { data: any[]; loading: boolean }) {
    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[var(--navy-50)]/50 border-b border-slate-200">
                    <th className={thClass}>Client</th>
                    <th className={thClass}>Manager</th>
                    <th className={thClass}>Work Type</th>
                    <th className={thClass}>Due Date</th>
                    <th className={thClass}>Budget</th>
                    <th className={thClass}>Billed</th>
                    <th className={thClass}>Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {loading ? <LoadingRow cols={7} /> : data.length === 0 ? <EmptyRow cols={7} text="No assignments found." /> : data.map((a: any) => (
                    <tr key={a.assignment_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className={cn(tdClass, 'font-bold text-slate-900')}>{a.client_name}</td>
                        <td className={cn(tdClass, 'font-medium text-slate-600')}>{a.manager_name}</td>
                        <td className={cn(tdClass, 'font-medium text-slate-700')}>{a.work_type || 'N/A'}</td>
                        <td className={cn(tdClass, 'font-medium text-slate-600')}>{a.due_date ? format(new Date(a.due_date), 'dd MMM yyyy') : 'N/A'}</td>
                        <td className={cn(tdClass, 'font-bold text-slate-700')}>{formatINR(Number(a.budget_amount || 0))}</td>
                        <td className={cn(tdClass, 'font-black text-slate-900')}>{formatINR(Number(a.billed_amount || 0))}</td>
                        <td className={tdClass}>
                            <span className={cn("inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                a.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                a.status === 'completed' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                "bg-slate-50 text-slate-600 border-slate-100"
                            )}>{a.status}</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function ManagerBreakdownTable({ data, sortKey }: { data: any[]; sortKey: string }) {
    // Sort based on which card was clicked
    const sorted = [...data].sort((a: any, b: any) => {
        if (sortKey === 'billed') return Number(b.billed_amount || 0) - Number(a.billed_amount || 0);
        if (sortKey === 'budget') return Number(b.total_budget || 0) - Number(a.total_budget || 0);
        // billing % sort
        const pctA = billingPercent(Number(a.billed_amount || 0), Number(a.total_budget || 0));
        const pctB = billingPercent(Number(b.billed_amount || 0), Number(b.total_budget || 0));
        return pctB - pctA;
    });

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[var(--navy-50)]/50 border-b border-slate-200">
                    <th className={thClass}>Manager</th>
                    <th className={thClass}>Clients</th>
                    <th className={thClass}>Assignments</th>
                    <th className={thClass}>Budget</th>
                    <th className={thClass}>Billed</th>
                    <th className={thClass}>Billing %</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {sorted.length === 0 ? <EmptyRow cols={6} text="No managers found." /> : sorted.map((m: any) => {
                    const pct = billingPercent(Number(m.billed_amount || 0), Number(m.total_budget || 0));
                    return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className={cn(tdClass, 'font-bold text-slate-900')}>{m.display_name || m.full_name}</td>
                            <td className={cn(tdClass, 'font-medium text-slate-700')}>{m.client_count}</td>
                            <td className={cn(tdClass, 'font-medium text-slate-700')}>{m.assignment_count}</td>
                            <td className={cn(tdClass, 'font-bold text-slate-700')}>{formatINR(Number(m.total_budget || 0))}</td>
                            <td className={cn(tdClass, 'font-black text-slate-900')}>{formatINR(Number(m.billed_amount || 0))}</td>
                            <td className={tdClass}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black" style={{ color: billingPercentColor(pct) }}>{pct}%</span>
                                    <div className="w-16 h-1 bg-slate-100 rounded-none overflow-hidden">
                                        <div className="h-full rounded-none" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: billingPercentColor(pct) }} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Search, Loader2 } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ClientData {
    id: string;
    name: string;
    gstn?: string;
    status: string;
    onboarded_date?: string;
    billed_amount?: number;
}

interface ClientTabProps {
    managerId: string;
}

export function ClientTab({ managerId }: ClientTabProps) {
    const [data, setData] = useState<ClientData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/managers/${managerId}/clients`, {
                params: { search, page, limit: 10 }
            });
            setData(res.data.data);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        } finally {
            setLoading(false);
        }
    }, [managerId, search, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-4">
            <div className="relative max-w-sm group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-none text-sm font-medium focus:border-[var(--brand-navy)] outline-none transition-all"
                />
            </div>

            <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--navy-50)]/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-accent">Client Name</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-accent">Status</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-accent">Onboarded</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-right font-accent">Billed Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-[var(--brand-navy)] animate-spin" />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest font-accent">Loading Clients</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-500 font-medium">
                                        No clients found for this manager.
                                    </td>
                                </tr>
                            ) : data.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 group-hover:text-[var(--brand-navy)] transition-colors">{client.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-none text-[11px] font-bold uppercase tracking-wider",
                                            client.status === 'active' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-600 border border-slate-100"
                                        )}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {client.onboarded_date ? format(new Date(client.onboarded_date), 'dd MMM yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                                        {formatINR(client.billed_amount ?? 0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Pagination placeholder */}
            {total > 10 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-none text-sm font-bold text-slate-600 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button 
                        disabled={page * 10 >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-none text-sm font-bold text-slate-600 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Search, Loader2 } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProposalData {
    id: string;
    proposal_id: string;
    client_name: string;
    number: string;
    status: string;
    quotation_amount: number;
    amount?: number;
    date_sent?: string;
    created_at: string;
}

interface ProposalTabProps {
    managerId: string;
}

export function ProposalTab({ managerId }: ProposalTabProps) {
    const [data, setData] = useState<ProposalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/managers/${managerId}/proposals`, {
                params: { search, limit: 10 }
            });
            setData(res.data.data);
        } catch (err) {
            console.error('Failed to fetch proposals:', err);
        } finally {
            setLoading(false);
        }
    }, [managerId, search]); // Removed page dependency

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
                    placeholder="Search proposals..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-none text-sm font-medium focus:border-[var(--brand-navy)] outline-none transition-all"
                />
            </div>

            <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--navy-50)]/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-accent">Proposal ID</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-accent">Client Name</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-accent">Date Sent</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-accent">Status</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-right font-accent">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-[var(--brand-navy)] animate-spin" />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest font-accent">Loading Proposals</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium">
                                        No proposals found.
                                    </td>
                                </tr>
                            ) : data.map((proposal) => (
                                <tr key={proposal.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 group-hover:text-[var(--brand-navy)] transition-colors">#{proposal.proposal_id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                        {proposal.client_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {proposal.date_sent ? format(new Date(proposal.date_sent), 'dd MMM yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-none text-[11px] font-bold uppercase tracking-wider",
                                            proposal.status === 'won' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
                                            proposal.status === 'lost' ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                            "bg-amber-50 text-amber-700 border border-amber-100"
                                        )}>
                                            {proposal.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                                        {formatINR(proposal.amount ?? proposal.quotation_amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

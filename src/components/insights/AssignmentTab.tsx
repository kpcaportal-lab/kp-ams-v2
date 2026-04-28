'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AssignmentData {
    id: string;
    assignment_id: string;
    client_name: string;
    work_type: string;
    due_date?: string;
    status: string;
}

interface AssignmentTabProps {
    managerId: string;
}

export function AssignmentTab({ managerId }: AssignmentTabProps) {
    const [data, setData] = useState<AssignmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    // Pagination state removed as it was unused
    // const [page, setPage] = useState(1);
    // const [total, setTotal] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/managers/${managerId}/assignments`, {
                params: { search, limit: 10 }
            });
            setData(res.data.data);
        } catch (err) {
            console.error('Failed to fetch assignments:', err);
        } finally {
            setLoading(false);
        }
    }, [managerId, search]);

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
                    placeholder="Search assignments..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand-navy)]/10 outline-none transition-all"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--navy-50)]/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider font-accent">Assignment ID</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider font-accent">Client Name</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider font-accent">Work Type</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider font-accent">Due Date</th>
                                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider font-accent">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-[var(--brand-navy)] animate-spin" />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest font-accent">Loading Assignments</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium">
                                        No active assignments.
                                    </td>
                                </tr>
                            ) : data.map((assignment) => (
                                <tr key={assignment.assignment_id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 group-hover:text-[var(--brand-navy)] transition-colors">#{assignment.assignment_id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                        {assignment.client_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {assignment.work_type}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {assignment.due_date ? format(new Date(assignment.due_date), 'dd MMM yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                                            assignment.status === 'active' ? "bg-[var(--navy-50)] text-[var(--brand-navy)] border border-[var(--navy-100)]" : 
                                            assignment.status === 'completed' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                            "bg-slate-50 text-slate-600 border border-slate-100"
                                        )}>
                                            {assignment.status}
                                        </span>
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

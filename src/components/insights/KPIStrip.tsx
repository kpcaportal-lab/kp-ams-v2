'use client';

import { Users, FileText, Briefcase, IndianRupee, TrendingUp } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KPIStripProps {
    data: {
        totalClients: number;
        totalProposals: number;
        activeAssignments: number;
        totalBilled: number;
    } | null;
    isLoading: boolean;
}

export function KPIStrip({ data, isLoading }: KPIStripProps) {
    const stats = [
        {
            label: 'Total Clients',
            value: data?.totalClients ?? 0,
            icon: Users,
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Total Proposals',
            value: data?.totalProposals ?? 0,
            icon: FileText,
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Assignments',
            value: data?.activeAssignments ?? 0,
            icon: Briefcase,
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Total Billed',
            value: data?.totalBilled ?? 0,
            isCurrency: true,
            icon: IndianRupee,
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-white p-7 rounded-[2.5rem] border ${stat.border} shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-500 relative overflow-hidden group hover:-translate-y-1`}
                >
                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full opacity-40 group-hover:scale-125 transition-transform duration-700`} />
                    
                    <div className="flex flex-col gap-4 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner-sm ${stat.bg} ${stat.text}`}>
                            <stat.icon size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-10 w-24 bg-slate-100 animate-pulse rounded mt-1" />
                            ) : (
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {stat.isCurrency ? formatINR(stat.value as number) : stat.value.toLocaleString()}
                                </h3>
                            )}
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-accent">{stat.label}</p>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 relative z-10">
                        <TrendingUp size={12} strokeWidth={3} className="text-emerald-500" />
                        <span>+12% from last quarter</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

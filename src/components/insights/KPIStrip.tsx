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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-white p-5 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
                >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 opacity-40 group-hover:scale-110 transition-transform`} />
                    
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-accent">{stat.label}</p>
                            {isLoading ? (
                                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded mt-1" />
                            ) : (
                                <h3 className="text-2xl font-black text-slate-900">
                                    {stat.isCurrency ? formatINR(stat.value as number) : stat.value.toLocaleString()}
                                </h3>
                            )}
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.text}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 relative z-10">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span>+12% from last quarter</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

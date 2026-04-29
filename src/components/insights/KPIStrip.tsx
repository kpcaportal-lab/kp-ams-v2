'use client';

import { Users, FileText, Briefcase, IndianRupee, TrendingUp } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-none border border-slate-200 hover:border-brand-navy transition-all relative overflow-hidden group shadow-none"
                >
                    <div className="flex flex-col gap-5 relative z-10">
                        <div className={cn("w-12 h-12 rounded-none flex items-center justify-center border border-slate-100 transition-all group-hover:bg-brand-navy group-hover:border-brand-navy group-hover:text-white", stat.text)}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-none mb-2" />
                            ) : (
                                <h3 className="text-3xl font-black text-brand-navy tracking-tighter mb-1 font-number">
                                    {stat.isCurrency ? formatINR(stat.value as number) : stat.value.toLocaleString()}
                                </h3>
                            )}
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                {stat.label}
                            </p>
                        </div>
                    </div>

                    {/* Subtle Brand Accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                         <stat.icon size={64} className="translate-x-4 -translate-y-4" />
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-none border border-emerald-100">
                            <TrendingUp size={12} strokeWidth={3} />
                            <span className="font-number">+12.4%</span>
                        </div>
                        <div className="w-1 h-1 bg-brand-red rounded-none" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

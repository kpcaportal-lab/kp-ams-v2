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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, idx) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        delay: idx * 0.1, 
                        duration: 0.8, 
                        ease: [0.215, 0.61, 0.355, 1] 
                    }}
                    className={`bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)] hover:shadow-[0_40px_80px_rgba(15,23,42,0.12)] transition-all duration-700 relative overflow-hidden group hover:-translate-y-3 cursor-default`}
                >
                    {/* Dynamic Background Pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-full -mr-10 -mt-10 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-brand-navy/5 to-transparent rounded-full -ml-10 -mb-10 blur-2xl" />
                    </div>

                    <div className="flex flex-col gap-6 relative z-10">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-slate-50 ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={32} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-500" />
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-xl mb-2" />
                            ) : (
                                <h3 className="text-4xl font-black text-slate-900 tracking-[-0.04em] mb-1">
                                    {stat.isCurrency ? formatINR(stat.value as number) : stat.value.toLocaleString()}
                                </h3>
                            )}
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] font-accent flex items-center gap-2">
                                {stat.label}
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 bg-emerald-50/50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                            <TrendingUp size={12} strokeWidth={3} />
                            <span>+12.4%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-opacity duration-500">Live Metric</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

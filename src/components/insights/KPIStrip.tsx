'use client';

import { Users, FileText, Briefcase, IndianRupee, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import { billingPercentColor } from '@/utils/billingPercent';
import { formatINR, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface KPIStripProps {
    data: {
        totalClients: number;
        totalProposals: number;
        activeAssignments: number;
        totalBilled: number;
        totalBudget?: number;
        totalReceived?: number;
        billingPct?: number;
        collectionPct?: number;
    } | null;
    isLoading: boolean;
    onCardClick?: (drillKey: string) => void;
    activeCard?: string | null;
}

export function KPIStrip({ data, isLoading, onCardClick, activeCard }: KPIStripProps) {
    const stats = [
        {
            label: 'Total Clients',
            value: data?.totalClients ?? 0,
            icon: Users,
            drillKey: 'clients',
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Total Proposals',
            value: data?.totalProposals ?? 0,
            icon: FileText,
            drillKey: 'proposals',
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Active Assignments',
            value: data?.activeAssignments ?? 0,
            icon: Briefcase,
            drillKey: 'assignments',
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Total Budget',
            value: data?.totalBudget ?? 0,
            isCurrency: true,
            icon: Wallet,
            drillKey: 'budget',
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
            drillKey: 'billed',
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Billing %',
            value: data?.billingPct ?? 0,
            isPercent: true,
            icon: BarChart3,
            drillKey: 'billing',
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Total Received',
            value: data?.totalReceived ?? 0,
            isCurrency: true,
            icon: Wallet,
            drillKey: 'received',
            color: 'navy',
            bg: 'bg-[var(--navy-50)]',
            text: 'text-[var(--brand-navy)]',
            border: 'border-[var(--navy-100)]'
        },
        {
            label: 'Collection %',
            value: data?.collectionPct ?? 0,
            isPercent: true,
            icon: TrendingUp,
            drillKey: 'collection',
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
                    onClick={() => onCardClick?.(stat.drillKey)}
                    className={cn(
                        "bg-white p-6 rounded-none border border-slate-200 hover:border-brand-navy transition-all relative overflow-hidden group shadow-none cursor-pointer select-none",
                        activeCard === stat.drillKey && "border-brand-navy ring-1 ring-[var(--brand-navy)] bg-[var(--navy-50)]/30"
                    )}
                >
                    <div className="flex flex-col gap-5 relative z-10">
                        <div className={cn("w-10 h-10 rounded-none flex items-center justify-center border border-slate-100 transition-all group-hover:bg-brand-navy group-hover:border-brand-navy group-hover:text-white", stat.text)}>
                            <stat.icon size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-none mb-2" />
                            ) : (
                                <h3 className="text-2xl font-extrabold tracking-tighter mb-1 font-number" style={stat.isPercent ? { color: billingPercentColor(stat.value as number) } : undefined}>
                                    {stat.isPercent ? `${stat.value}%` : stat.isCurrency ? formatINR(stat.value as number) : stat.value.toLocaleString()}
                                </h3>
                            )}
                            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                {stat.label}
                            </p>
                            {stat.isPercent && !isLoading && (
                                <div className="mt-2 w-full h-1 bg-slate-100 rounded-none overflow-hidden">
                                    <div className="h-full rounded-none transition-all" style={{ width: `${Math.min(stat.value as number, 100)}%`, backgroundColor: billingPercentColor(stat.value as number) }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subtle Brand Accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                         <stat.icon size={64} className="translate-x-4 -translate-y-4" />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2 text-[10px] font-extrabold text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-none border border-emerald-100">
                            <TrendingUp size={12} strokeWidth={3} />
                            <span className="font-number">+0%</span>
                        </div>
                        <div className="w-1 h-1 bg-brand-red rounded-none" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

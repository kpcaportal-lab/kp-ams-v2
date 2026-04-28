'use client';

import { ChevronDown, ChevronUp, User, Mail, Users, FileText, Briefcase, IndianRupee } from 'lucide-react';
import { formatINR, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DetailPanel } from './DetailPanel';

interface ManagerCardProps {
    manager: {
        id: string;
        full_name: string;
        display_name: string;
        role: string;
        email: string;
        client_count: number;
        assignment_count: number;
        proposal_count: number;
        billed_amount: number;
    };
    isExpanded: boolean;
    onToggle: () => void;
    fiscalYear: string;
}

export function ManagerCard({ manager, isExpanded, onToggle, fiscalYear }: ManagerCardProps) {
    return (
        <div className={cn(
            "bg-white border rounded-2xl mb-4 transition-all overflow-hidden",
            isExpanded ? "border-[var(--navy-200)] ring-4 ring-[var(--navy-50)]" : "border-slate-200 hover:border-slate-300"
        )}>
            {/* Header / Summary Row */}
            <div 
                onClick={onToggle}
                className="flex flex-col lg:flex-row lg:items-center p-4 lg:p-6 cursor-pointer select-none gap-4"
            >
                {/* Profile Section */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                        <User size={24} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-base font-bold text-slate-900 truncate">{manager.full_name}</h4>
                        <div className="flex items-center gap-2 text-[13px] text-slate-500">
                            <span className="font-bold text-[var(--brand-navy)] uppercase text-[10px] bg-[var(--navy-50)] px-1.5 py-0.5 rounded border border-[var(--navy-100)] font-accent">
                                {manager.role.replace('_', ' ')}
                            </span>
                            <span className="truncate flex items-center gap-1">
                                <Mail size={12} /> {manager.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8 flex-[1.5]">
                    <StatItem icon={Users} label="Clients" value={manager.client_count} color="navy" />
                    <StatItem icon={FileText} label="Proposals" value={manager.proposal_count} color="navy" />
                    <StatItem icon={Briefcase} label="Active" value={manager.assignment_count} color="navy" />
                    <StatItem icon={IndianRupee} label="Billed" value={manager.billed_amount} color="navy" isCurrency />
                </div>

                {/* Expand Toggle */}
                <div className="flex items-center justify-center lg:justify-end lg:w-12">
                    <div className={cn(
                        "p-2 rounded-full transition-colors",
                        isExpanded ? "bg-[var(--brand-navy)] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                    )}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            {/* Expandable Detail Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="border-t border-slate-100 bg-slate-50/50">
                            <DetailPanel managerId={manager.id} fiscalYear={fiscalYear} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface StatItemProps {
    icon: React.ElementType; // Better than 'any'
    label: string;
    value: string | number;
    color: 'navy';
    isCurrency?: boolean;
}

function StatItem({ icon: Icon, label, value, color, isCurrency = false }: StatItemProps) {
    const colors: Record<string, string> = {
        navy: "text-[var(--brand-navy)] bg-[var(--navy-50)]",
    };

    return (
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg shrink-0", colors[color])}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-accent">{label}</p>
                <p className="text-sm font-black text-slate-900">
                    {isCurrency ? formatINR(Number(value)) : value}
                </p>
            </div>
        </div>
    );
}

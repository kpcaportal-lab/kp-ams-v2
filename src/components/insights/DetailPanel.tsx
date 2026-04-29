'use client';

import { useState } from 'react';
import { Users, FileText, Briefcase, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientTab } from './ClientTab';
import { ProposalTab } from './ProposalTab';
import { AssignmentTab } from './AssignmentTab';
import { BillingTab } from './BillingTab';

type TabId = 'clients' | 'proposals' | 'assignments' | 'billing';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ size: number }>;
}

interface DetailPanelProps {
    managerId: string;
    fiscalYear: string;
}

export function DetailPanel({ managerId, fiscalYear }: DetailPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>('clients');

    const tabs: Tab[] = [
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'proposals', label: 'Proposals', icon: FileText },
        { id: 'assignments', label: 'Assignments', icon: Briefcase },
        { id: 'billing', label: 'Billed Amount', icon: IndianRupee },
    ];

    return (
        <div className="p-4 lg:p-8">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-none border border-slate-200 w-fit mb-8 shadow-none">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-none text-sm font-bold transition-all",
                            activeTab === tab.id 
                                ? "bg-[var(--brand-navy)] text-white shadow-none" 
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-accent"
                        )}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'clients' && <ClientTab managerId={managerId} />}
                {activeTab === 'proposals' && <ProposalTab managerId={managerId} />}
                {activeTab === 'assignments' && <AssignmentTab managerId={managerId} />}
                {activeTab === 'billing' && <BillingTab managerId={managerId} fiscalYear={fiscalYear} />}
            </div>
        </div>
    );
}

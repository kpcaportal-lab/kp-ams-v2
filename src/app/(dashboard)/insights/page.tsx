'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { InsightsHeader } from '@/components/insights/InsightsHeader';
import { KPIStrip } from '@/components/insights/KPIStrip';
import { FilterBar } from '@/components/insights/FilterBar';
import { ManagerCard } from '@/components/insights/ManagerCard';
import FirmDrillDown from '@/components/insights/FirmDrillDown';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatINR } from '@/lib/utils';
import { billingPercent, billingPercentColor } from '@/utils/billingPercent';

interface ManagerData {
    id: string;
    full_name: string;
    display_name: string;
    role: string;
    email: string;
    client_count: number;
    proposal_count: number;
    assignment_count: number;
    billed_amount: number;
    billing_pct: number;
    total_budget: number;
}

interface SummaryData {
    totalClients: number;
    totalProposals: number;
    activeAssignments: number;
    totalBilled: number;
    totalBudget: number;
    billingPct: number;
}

interface LeaderData {
    id: string;
    name: string;
    initials: string;
    role: string;
    totalClients: number;
    totalBudget: number;
    totalBilling: number;
    billingPct: number;
}

export default function InsightsPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
    const router = useRouter();
    const pageRef = useRef<HTMLDivElement>(null);

    // Filter States
    const [period, setPeriod] = useState('2025-26');
    const [sortBy, setSortBy] = useState('billed');
    const [searchQuery, setSearchQuery] = useState('');

    // Data States
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [managers, setManagers] = useState<ManagerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedManagerId, setExpandedManagerId] = useState<string | null>(null);
    const [leaders, setLeaders] = useState<LeaderData[]>([]);
    const [activeDrillCard, setActiveDrillCard] = useState<string | null>(null);

    // Role Guard
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user && !['admin', 'partner', 'director'].includes(user.role)) {
                router.push('/dashboard');
            }
        }
    }, [user, isAuthenticated, authLoading, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, managersRes, leadersRes] = await Promise.all([
                api.get('/api/insights/summary', { params: { fiscal_year: period } }),
                api.get('/api/insights/managers', { params: { period, sort: sortBy } }),
                api.get('/api/insights/leaders', { params: { fiscal_year: period } })
            ]);
            setSummaryData(summaryRes.data);
            setManagers(managersRes.data.map((m: { display_name?: string; full_name: string }) => ({
                ...m,
                display_name: m.display_name || m.full_name
            })));
            setLeaders(leadersRes.data);
        } catch (err) {
            console.error('Failed to fetch insights:', err);
            toast.error('Failed to load insights data');
        } finally {
            setLoading(false);
        }
    }, [period, sortBy]);

    useEffect(() => {
        if (isAuthenticated && user && ['admin', 'partner', 'director'].includes(user.role)) {
            fetchData();
        }
    }, [isAuthenticated, user, fetchData]);

    const filteredManagers = managers.filter(m => 
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Export Logic
    const handleExportExcel = () => {
        const dataToExport = managers.map(m => ({
            'Manager Name': m.full_name,
            'Role': m.role,
            'Email': m.email,
            'Clients': m.client_count,
            'Proposals': m.proposal_count,
            'Assignments': m.assignment_count,
            'Billed Amount': m.billed_amount,
            'Total Budget': m.total_budget
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Manager Insights");
        XLSX.writeFile(wb, `KP_AMS_Insights_${period}.xlsx`);
        toast.success('Excel report exported successfully');
    };

    const handleExportPDF = async () => {
        if (!pageRef.current) return;
        
        const toastId = toast.loading('Generating PDF report...');
        try {
            const canvas = await html2canvas(pageRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1400
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`KP_AMS_Insights_${period}.pdf`);
            toast.success('PDF report exported successfully', { id: toastId });
        } catch (err) {
            console.error('PDF Export Error:', err);
            toast.error('Failed to generate PDF', { id: toastId });
        }
    };

    if (authLoading || !user || !['admin', 'partner', 'director'].includes(user.role)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Verifying Access</p>
            </div>
        );
    }

    return (
        <div ref={pageRef} className="pb-20">
            <InsightsHeader onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
            
            <KPIStrip
                data={summaryData}
                isLoading={loading}
                onCardClick={(key) => setActiveDrillCard(prev => prev === key ? null : key)}
                activeCard={activeDrillCard}
            />

            {/* Firm Drill-Down Panel */}
            <FirmDrillDown
                activeCard={activeDrillCard}
                managers={managers.filter((m: any) => m.role === 'manager' || m.role === 'assistant_manager')}
                fiscalYear={period}
                onClose={() => setActiveDrillCard(null)}
            />

            {/* Partner & Director Insights Section */}
            {leaders.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Partner & Director Insights</h2>
                        <div className="flex-1 h-[1px] bg-slate-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leaders.map((leader) => {
                            const pct = leader.billingPct;
                            return (
                                <div key={leader.id} className="bg-white p-6 rounded-none border border-slate-200 overflow-hidden" style={{ borderTop: '3px solid var(--kp-navy, var(--brand-navy))' }}>
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-12 h-12 rounded-none bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 text-sm font-black">
                                            {leader.initials}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-base font-bold text-slate-900 truncate">{leader.name}</h4>
                                            <span className="font-black text-brand-navy uppercase text-[9px] bg-slate-50 px-1.5 py-0.5 rounded-none border border-slate-200 tracking-wider">
                                                {leader.role.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Clients</p>
                                            <p className="text-sm font-black text-slate-900">{leader.totalClients}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Budget</p>
                                            <p className="text-sm font-black text-slate-900">{formatINR(leader.totalBudget)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Billing</p>
                                            <p className="text-sm font-black text-slate-900">{formatINR(leader.totalBilling)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing %</p>
                                            <p className="text-sm font-black" style={{ color: billingPercentColor(pct) }}>{pct}%</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <FilterBar 
                period={period} setPeriod={setPeriod}
                sortBy={sortBy} setSortBy={setSortBy}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            />

            {/* Manager List Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        Manager Performance <span className="text-slate-300 text-sm font-bold font-mono">({filteredManagers.length})</span>
                    </h2>
                </div>

                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-white border border-slate-100 rounded-none animate-pulse mb-4" />
                    ))
                ) : filteredManagers.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-none p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-none flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No managers found</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or search query to find the data you&apos;re looking for.</p>
                    </div>
                ) : (
                    filteredManagers.map((manager) => (
                        <ManagerCard 
                            key={manager.id} 
                            manager={manager}
                            isExpanded={expandedManagerId === manager.id}
                            onToggle={() => setExpandedManagerId(expandedManagerId === manager.id ? null : manager.id)}
                            fiscalYear={period}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

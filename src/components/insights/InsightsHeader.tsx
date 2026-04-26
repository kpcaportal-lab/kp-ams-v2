'use client';

import { FileDown, FileSpreadsheet, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/authStore';

interface InsightsHeaderProps {
    onExportPDF: () => void;
    onExportExcel: () => void;
}

export function InsightsHeader({ onExportPDF, onExportExcel }: InsightsHeaderProps) {
    const { user } = useAuthStore();
    
    // Dynamic FY based on current date (April to March)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyEnd = (fyStart + 1).toString().slice(-2);
    const fyDisplay = `FY ${fyStart}–${fyEnd}`;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-[var(--brand-navy)] tracking-tight">
                    Insights
                </h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2 font-accent font-medium">
                    Firm-wide performance overview <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-red)] opacity-60" /> {fyDisplay}
                </p>
            </div>

            <div className="flex items-center gap-3">
                {user && (
                    <div className="hidden sm:flex items-center px-3 py-1.5 bg-[var(--navy-50)] border border-[var(--navy-100)] rounded-full mr-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--brand-navy)] animate-pulse mr-2" />
                        <span className="text-[11px] font-bold text-[var(--brand-navy)] uppercase tracking-wider font-accent">
                            {user.role} View
                        </span>
                    </div>
                )}
                
                <button
                    onClick={onExportExcel}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group"
                >
                    <FileSpreadsheet size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>Export Excel</span>
                </button>

                <button
                    onClick={onExportPDF}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 rounded-xl text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
                >
                    <FileDown size={18} className="group-hover:scale-110 transition-transform" />
                    <span>Export PDF</span>
                </button>
            </div>
        </div>
    );
}

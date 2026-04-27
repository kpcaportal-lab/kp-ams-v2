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
                <h1 className="text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm font-accent">
                    Firm <span className="text-brand-gold">Insights</span>
                </h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium italic">
                    Firm-wide performance overview <span className="w-1.5 h-1.5 rounded-full bg-brand-gold opacity-60" /> {fyDisplay}
                </p>
            </div>

            <div className="flex items-center gap-3">
                {user && (
                    <div className="hidden sm:flex items-center px-4 py-2 bg-brand-navy/5 border border-brand-navy/10 rounded-full mr-2">
                        <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse mr-2" />
                        <span className="text-[11px] font-black text-brand-navy uppercase tracking-widest font-accent">
                            {user.role} View
                        </span>
                    </div>
                )}
                
                <button
                    onClick={onExportExcel}
                    className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm hover:-translate-y-1 group active:scale-95"
                >
                    <FileSpreadsheet size={18} strokeWidth={3} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span>Export Excel</span>
                </button>

                <button
                    onClick={onExportPDF}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-brand-navy text-white rounded-[1.5rem] text-sm font-black hover:bg-slate-800 transition-all shadow-[0_20px_40px_rgba(30,58,95,0.25)] hover:-translate-y-1 group active:scale-95 border-b-4 border-brand-gold/30"
                >
                    <FileDown size={18} strokeWidth={3} className="text-brand-gold group-hover:scale-110 transition-transform" />
                    <span>Export PDF</span>
                </button>
            </div>
        </div>
    );
}

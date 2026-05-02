'use client';

import { FileDown, FileSpreadsheet } from 'lucide-react';
// import { format } from 'date-fns'; // Not used
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
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    Firm <span className="text-brand-red">Insights</span>
                </h1>
                <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium italic">
                    Firm-wide performance overview <span className="w-1.5 h-1.5 rounded-none bg-brand-red/30" /> {fyDisplay}
                </p>
            </div>

            <div className="flex items-center gap-3">
                {user && (
                    <div className="hidden sm:flex items-center px-4 py-2 bg-brand-navy text-white rounded-none mr-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">
                            {user.role} View
                        </span>
                    </div>
                )}

                <button
                    onClick={onExportExcel}
                    className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-slate-200 rounded-none text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition-all group active:scale-95"
                >
                    <FileSpreadsheet size={16} strokeWidth={3} className="text-brand-navy group-hover:scale-110 transition-transform" />
                    <span>Export Excel</span>
                </button>

                <button
                    onClick={onExportPDF}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-brand-navy text-white rounded-none text-xs font-extrabold hover:bg-slate-800 transition-all group active:scale-95 border-b-2 border-brand-red"
                >
                    <FileDown size={16} strokeWidth={3} className="text-white group-hover:scale-110 transition-transform" />
                    <span>Export PDF</span>
                </button>
            </div>
        </div>
    );
}

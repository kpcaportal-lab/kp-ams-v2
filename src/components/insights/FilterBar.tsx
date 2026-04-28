'use client';

import { Search, SlidersHorizontal, ChevronDown, Calendar } from 'lucide-react';

interface FilterBarProps {
    period: string;
    setPeriod: (val: string) => void;
    sortBy: string;
    setSortBy: (val: string) => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
}

export function FilterBar({ 
    period, setPeriod, 
    sortBy, setSortBy, 
    searchQuery, setSearchQuery 
}: FilterBarProps) {
    return (
        <div className="bg-white border border-slate-100 p-2 rounded-[2rem] flex flex-col md:flex-row items-center gap-2 mb-10 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition-all duration-500">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-navy transition-colors duration-300" />
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by manager name or email..."
                    className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-sm font-semibold focus:bg-white focus:border-brand-gold/30 focus:ring-4 focus:ring-brand-gold/5 transition-all outline-none placeholder:text-slate-400"
                />
            </div>

            {/* Vertical Divider (Hidden on Mobile) */}
            <div className="hidden md:block w-[1px] h-10 bg-slate-100 mx-2" />

            <div className="flex items-center gap-2 w-full md:w-auto p-1 md:p-0">
                {/* Period Select */}
                <div className="relative flex-1 md:flex-none group/select">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-brand-navy transition-colors" />
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="appearance-none w-full md:w-48 pl-11 pr-10 py-4 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-xs font-black text-slate-600 focus:bg-white focus:border-brand-gold/30 transition-all outline-none cursor-pointer font-accent uppercase tracking-widest hover:bg-slate-100/50"
                    >
                        <option value="2025-26">FY 2025-26</option>
                        <option value="2024-25">FY 2024-25</option>
                        <option value="2023-24">FY 2023-24</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/select:translate-y-0.5 transition-transform" />
                </div>

                {/* Sort Select */}
                <div className="relative flex-1 md:flex-none group/select">
                    <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-brand-navy transition-colors" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none w-full md:w-48 pl-11 pr-10 py-4 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-xs font-black text-slate-600 focus:bg-white focus:border-brand-gold/30 transition-all outline-none cursor-pointer font-accent uppercase tracking-widest hover:bg-slate-100/50"
                    >
                        <option value="billed">Sort by Billed</option>
                        <option value="clients">Sort by Clients</option>
                        <option value="assignments">Sort by Assignments</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover/select:translate-y-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}

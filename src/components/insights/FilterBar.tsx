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
        <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3 mb-6 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 w-full group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--brand-navy)] transition-colors" />
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by manager name or email..."
                    className="w-full pl-11 pr-4 py-2.5 bg-[var(--navy-50)] border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[var(--brand-navy)]/10 transition-all outline-none"
                />
            </div>

            {/* Vertical Divider (Hidden on Mobile) */}
            <div className="hidden md:block w-[1px] h-8 bg-slate-100" />

            <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Period Select */}
                <div className="relative flex-1 md:flex-none">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="appearance-none w-full md:w-44 pl-10 pr-10 py-2.5 bg-[var(--navy-50)] border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[var(--brand-navy)]/10 transition-all outline-none cursor-pointer font-accent"
                    >
                        <option value="2025-26">FY 2025-26</option>
                        <option value="2024-25">FY 2024-25</option>
                        <option value="2023-24">FY 2023-24</option>
                        <option value="Q1-2024">Q1 2024</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Sort Select */}
                <div className="relative flex-1 md:flex-none">
                    <SlidersHorizontal size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none w-full md:w-44 pl-10 pr-10 py-2.5 bg-[var(--navy-50)] border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[var(--brand-navy)]/10 transition-all outline-none cursor-pointer font-accent"
                    >
                        <option value="billed">Sort by Billed</option>
                        <option value="clients">Sort by Clients</option>
                        <option value="assignments">Sort by Assignments</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

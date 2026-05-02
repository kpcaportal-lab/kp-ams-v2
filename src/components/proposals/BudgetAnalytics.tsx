'use client';

import React, { useEffect, useState } from 'react';
import { 
    TrendingUp, DollarSign, Briefcase, FileText, 
    ChevronDown, BarChart2, PieChart, ArrowUpRight,
    Target, Zap
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, LineChart, Line,
    AreaChart, Area, Legend
} from 'recharts';
import { useBudgetStore } from '@/store/budgetStore';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const FISCAL_YEARS = ['2024-25', '2025-26', '2026-27'];

export default function BudgetAnalytics() {
    const { 
        summary, comparative, forecasting, 
        fetchSummary, fetchComparative, fetchForecasting,
        isLoading 
    } = useBudgetStore();

    const [selectedYear, setSelectedYear] = useState('2025-26');
    const [showCharts, setShowCharts] = useState(false);

    useEffect(() => {
        fetchSummary(selectedYear);
        fetchComparative();
        fetchForecasting(selectedYear);
    }, [selectedYear, fetchSummary, fetchComparative, fetchForecasting]);

    const stats = [
        { 
            label: 'Total Proposals', 
            value: summary?.total_proposals || 0, 
            icon: FileText, 
            color: 'text-brand-navy', 
            bg: 'bg-brand-navy/5',
            suffix: ''
        },
        { 
            label: 'Conversion Rate', 
            value: summary?.conversion_rate || 0, 
            icon: TrendingUp, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            suffix: '%'
        },
        { 
            label: 'Won Portfolio', 
            value: summary?.total_won_value || 0, 
            icon: DollarSign, 
            color: 'text-brand-red', 
            bg: 'bg-brand-red/5',
            isCurrency: true
        },
        { 
            label: 'Pipeline Value', 
            value: summary?.total_pipeline_value || 0, 
            icon: Briefcase, 
            color: 'text-slate-600', 
            bg: 'bg-slate-50',
            isCurrency: true
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header & Year Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-navy text-white rounded-none">
                        <BarChart2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight font-accent">
                            Budget <span className="text-brand-red">Analytics</span>
                        </h2>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            Fiscal Performance Matrix
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full md:w-48 appearance-none bg-white border border-slate-200 px-5 py-3 pr-12 rounded-none font-extrabold text-brand-navy focus:border-brand-red outline-none transition-all cursor-pointer text-sm shadow-none"
                        >
                            {FISCAL_YEARS.map(year => (
                                <option key={year} value={year}>FY {year}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>

                    <button
                        onClick={() => setShowCharts(!showCharts)}
                        className={cn(
                            "px-5 py-3 border font-extrabold text-sm uppercase tracking-widest transition-all rounded-none",
                            showCharts 
                                ? "bg-brand-red text-white border-brand-red" 
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        {showCharts ? 'Hide Trends' : 'View Trends'}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative overflow-hidden p-7 rounded-none bg-white border border-slate-200/60 shadow-none transition-all duration-400"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <p className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                                    {stat.isCurrency 
                                        ? formatIndianCurrency(stat.value, true, true) 
                                        : `${stat.value}${stat.suffix}`
                                    }
                                </p>
                            </div>
                            <div className={cn(
                                "w-12 h-12 rounded-none flex items-center justify-center transition-all group-hover:scale-110",
                                stat.bg, stat.color
                            )}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        
                        {/* YoY Growth indicator for Won Portfolio */}
                        {stat.label === 'Won Portfolio' && comparative.find(c => c.fiscal_year === selectedYear)?.yoy_growth !== undefined && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className={cn(
                                    "flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-none border uppercase tracking-widest",
                                    (comparative.find(c => c.fiscal_year === selectedYear)?.yoy_growth || 0) >= 0
                                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                        : "text-brand-red bg-brand-red/5 border-brand-red/10"
                                )}>
                                    {(comparative.find(c => c.fiscal_year === selectedYear)?.yoy_growth || 0) >= 0 ? '+' : ''}
                                    {comparative.find(c => c.fiscal_year === selectedYear)?.yoy_growth}% YoY
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 italic">Growth Index</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <AnimatePresence>
                {showCharts && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {/* Revenue Trend */}
                        <div className="bg-white border border-slate-200 p-8 rounded-none">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Revenue Growth Trend</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Year-on-Year won portfolio value</p>
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-100">
                                    <TrendingUp size={16} className="text-brand-navy" />
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={comparative}>
                                        <defs>
                                            <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="fiscal_year" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                            tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1e293b', 
                                                border: 'none', 
                                                borderRadius: '0', 
                                                color: '#fff',
                                                fontSize: '12px',
                                                fontWeight: '900'
                                            }}
                                            formatter={(value: any) => formatIndianCurrency(value)}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="won_value" 
                                            stroke="#1e293b" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorWon)" 
                                            name="Won Value"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Forecasting & CAGR */}
                        <div className="bg-slate-900 p-8 rounded-none border border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <Target size={120} className="text-white" />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-brand-red flex items-center justify-center text-white">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">Growth Forecast</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-brand-red font-extrabold uppercase tracking-widest">CAGR: {forecasting?.projected_growth_rate}%</span>
                                            <span className="w-1 h-1 bg-slate-700" />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Confidence: {forecasting?.confidence_level}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Projected for Next Cycle</p>
                                        <div className="text-5xl font-extrabold text-white tracking-tighter font-number">
                                            {formatIndianCurrency(forecasting?.projected_next_year_value || 0, true, true)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800">
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Current Velocity</p>
                                            <p className="text-xl font-extrabold text-white font-number">{formatIndianCurrency(forecasting?.current_value || 0, true, true)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Expected Yield</p>
                                            <p className="text-xl font-extrabold text-brand-red font-number">+{formatIndianCurrency((forecasting?.projected_next_year_value || 0) - (forecasting?.current_value || 0), true, true)}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-white/5 border border-white/10 rounded-none backdrop-blur-sm">
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                            Intelligence based on current conversion rates and historical YoY performance metrics. Projections assume consistent market conditions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

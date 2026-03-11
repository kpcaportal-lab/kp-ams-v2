'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, Briefcase, CheckCircle, Clock, AlertCircle, XCircle, LayoutGrid, List, IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { SUBCATEGORY_LABELS, CATEGORY_LABELS, BILLING_CYCLE_LABELS, formatDate } from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import AddAssignmentModal from '@/components/modals/AddAssignmentModal';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } }
};

export default function AssignmentsPage() {
  const { assignments } = useAssignmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.scope_item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.partner_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [assignments, searchTerm, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const active = assignments.filter(a => a.status === 'active');
    const totalFees = assignments.reduce((sum, a) => sum + (a.total_fees || 0), 0);
    const activeFees = active.reduce((sum, a) => sum + (a.total_fees || 0), 0);
    return {
      total: assignments.length,
      active: active.length,
      totalFees,
      activeFees,
      drafts: assignments.filter(a => a.status === 'draft').length,
      completed: assignments.filter(a => a.status === 'completed').length,
    };
  }, [assignments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 uppercase tracking-tight">
             Active
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/10 uppercase tracking-tight">
             Draft
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/10 uppercase tracking-tight">
             Completed
          </span>
        );
      default:
        return <span className="text-[10px] font-bold text-slate-400 uppercase">{status}</span>;
    }
  };

  const kpiCards = [
    { label: 'Expected Revenue', value: formatIndianCurrency(stats.totalFees, true, true), icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50', subValue: 'Total pipeline' },
    { label: 'Active Projects', value: stats.active.toString(), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', subValue: `${stats.completed} recently completed` },
    { label: 'Drafts', value: stats.drafts.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', subValue: 'Pending activation' },
    { label: 'Total Volume', value: stats.total.toString(), icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50', subValue: 'Lifetime assignments' },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tightest">Assignments</h1>
          <p className="text-slate-500 font-medium mt-1 text-lg flex items-center gap-2">
            Professional engagement management <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <span className="text-blue-600/80 font-bold">{stats.total} Total</span>
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
             <button onClick={() => setViewMode('table')} className={cn("px-3 py-2 rounded-xl transition-all", viewMode === 'table' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" : "text-slate-400")}>
               <List size={18} strokeWidth={2.5} />
             </button>
             <button onClick={() => setViewMode('grid')} className={cn("px-3 py-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200" : "text-slate-400")}>
               <LayoutGrid size={18} strokeWidth={2.5} />
             </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black transition-all hover:shadow-[0_20px_40px_rgba(15,23,42,0.25)] hover:-translate-y-1 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} className="text-blue-400 group-hover:scale-125 transition-transform" />
            Add New Assignment
          </button>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <motion.div key={card.label} variants={item}
            className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white p-7 shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1">
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity", card.bg)} />
            <div className="flex flex-col gap-4">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner-sm", card.bg)}>
                <card.icon size={28} className={card.color} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{card.label}</div>
              </div>
              <div className="pt-2 border-t border-slate-50 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 tracking-tight">{card.subValue}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4 px-1">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by client, scope item, or partner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[1.5rem] border border-slate-200 bg-white text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 focus:shadow-sm transition-all shadow-thin"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-5 pr-10 py-4 rounded-[1.5rem] border border-slate-200 bg-white text-sm text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all appearance-none cursor-pointer shadow-thin min-w-[160px]">
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Drafts Only</option>
            <option value="completed">Completed</option>
          </select>
          
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-5 pr-10 py-4 rounded-[1.5rem] border border-slate-200 bg-white text-sm text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all appearance-none cursor-pointer shadow-thin min-w-[180px]">
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }} 
            className="p-4 rounded-[1.5rem] border border-slate-200 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-thin">
            <Filter size={20} />
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="relative rounded-[2.5rem] border border-slate-200/60 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.03)] overflow-hidden">
            {filteredAssignments.length === 0 ? (
              <div className="px-8 py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={32} className="text-slate-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Assignments Found</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">We couldn't find any assignments matching your current search criteria.</p>
                <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }} className="mt-6 text-blue-600 font-bold hover:underline text-sm">Clear all filters</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="text-left px-8 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Client & Scope</th>
                      <th className="text-left px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Category</th>
                      <th className="text-left px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest leading-none flex items-center gap-1.5 pt-6.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Professional Lead
                      </th>
                      <th className="text-right px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Proposed Fees</th>
                      <th className="text-center px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Billing</th>
                      <th className="text-center px-6 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Status</th>
                      <th className="text-right px-8 py-5 text-[11px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">Fiscal Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAssignments.map((a, i) => (
                      <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="group hover:bg-slate-50/30 transition-colors cursor-pointer">
                        <td className="px-8 py-6">
                          <Link href={`/assignments/${a.id}`} className="block">
                            <div className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-base">{a.client_name}</div>
                            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight line-clamp-1">{a.scope_item || SUBCATEGORY_LABELS[a.subcategory]}</div>
                          </Link>
                        </td>
                        <td className="px-6 py-6">
                          <div className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-black text-slate-500 inline-block">
                             Cat {a.category}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 shadow-sm uppercase">
                              {a.partner_name ? a.partner_name.charAt(0) : '?'}
                            </div>
                            <span className="font-bold text-slate-700">{a.partner_name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="font-black text-slate-900 text-base">{formatIndianCurrency(a.total_fees || 0, true, true)}</div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2.5 py-1 rounded-md">
                            {BILLING_CYCLE_LABELS[a.billing_cycle]}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          {getStatusBadge(a.status)}
                        </td>
                        <td className="px-8 py-6 text-right text-slate-500 font-black tracking-widest text-[11px]">
                          {a.fiscal_year}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group relative rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 overflow-hidden"
              >
                 <div className="absolute right-6 top-6">
                   {getStatusBadge(a.status)}
                 </div>
                 <div className="flex flex-col h-full gap-5">
                   <div>
                     <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 px-1">Engagement</div>
                     <Link href={`/assignments/${a.id}`}>
                       <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{a.client_name}</h3>
                     </Link>
                     <p className="text-sm font-bold text-slate-400 mt-2 leading-relaxed h-10 overflow-hidden text-ellipsis line-clamp-2">{a.scope_item || SUBCATEGORY_LABELS[a.subcategory]}</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Proposed Fee</div>
                        <div className="font-black text-slate-900 text-lg">{formatIndianCurrency(a.total_fees || 0, true, true)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billing</div>
                        <div className="font-black text-slate-800 text-sm mt-1 uppercase">{BILLING_CYCLE_LABELS[a.billing_cycle]}</div>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 ring-4 ring-white shadow-sm border border-slate-200">
                          {a.partner_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-[11px] font-black text-slate-600">{a.partner_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px]">
                        <Calendar size={12} strokeWidth={3} />
                        {a.fiscal_year}
                      </div>
                   </div>
                 </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AddAssignmentModal open={isModalOpen} setOpen={setIsModalOpen} />
    </div>
  );
}

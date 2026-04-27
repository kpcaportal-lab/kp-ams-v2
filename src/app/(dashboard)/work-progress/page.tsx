'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users, CheckCircle, Clock, IndianRupee,
  Target, TrendingUp, Calendar, ArrowRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import type { UserWorkProgress } from '@/types';
import { formatIndianCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } }
};

export default function WorkProgressPage() {
  const [progress, setProgress] = useState<UserWorkProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkProgress = async () => {
      try {
        const res = await api.get('/api/dashboard/work-progress');
        setProgress(res.data);
      } catch {
        toast.error('Failed to load work progress data');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkProgress();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="w-12 h-12 text-brand-navy animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Analyzing Firm Progress...</p>
    </div>
  );

  if (!progress) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
        <Target className="w-10 h-10 text-slate-200" />
      </div>
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Data Found</h3>
      <p className="text-slate-500 max-w-xs mt-2 font-medium italic">We couldn&apos;t find any assignment progress associated with your account yet.</p>
    </div>
  );

  const kpis = [
    { 
      label: 'Success Rate', 
      value: `${progress.completed_percentage}%`, 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20',
      description: 'Completion ratio'
    },
    { 
      label: 'Pending Focus', 
      value: `${progress.pending_percentage}%`, 
      icon: Clock, 
      color: 'text-brand-gold', 
      bg: 'bg-brand-gold/10', 
      border: 'border-brand-gold/20',
      description: 'Items in pipeline'
    },
    { 
      label: 'Completed Value', 
      value: formatIndianCurrency(progress.completed_amount, true, true), 
      icon: IndianRupee, 
      color: 'text-brand-gold', 
      bg: 'bg-brand-gold/10', 
      border: 'border-brand-gold/20',
      description: 'Realized revenue'
    },
    { 
      label: 'Pipeline Value', 
      value: formatIndianCurrency(progress.pending_amount, true, true), 
      icon: Target, 
      color: 'text-brand-navy', 
      bg: 'bg-brand-navy/10', 
      border: 'border-brand-navy/20',
      description: 'Future potential'
    },
  ];

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      {/* Premium Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative px-2"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-brand-gold" />
              <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest leading-none">Performance Insights</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tightest leading-tight">
              My Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-navy to-brand-gold">Progress</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-2xl italic">
              Strategic overview of your engagement completion and revenue trajectory.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-6 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Assignments</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums">{progress.total_proposals}</p>
            </div>
          </div>
        </div>
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      </motion.header>

      {/* KPI Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={idx}
            variants={item}
            className={cn(
              "relative group p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1 overflow-hidden"
            )}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-8">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                  <kpi.icon className={cn("w-6 h-6", kpi.color)} strokeWidth={2.5} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{kpi.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">{kpi.value}</h3>
                <p className="text-xs font-bold text-slate-500 mt-2 italic">{kpi.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed Analysis Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="px-1"
      >
        <UserProgressCard user={progress} />
      </motion.div>
    </div>
  );
}

function UserProgressCard({ user }: { user: UserWorkProgress }) {
  return (
    <div className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-200 shadow-sm">
      {/* Card Header */}
      <div className="p-10 border-b border-slate-100 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-brand-navy to-brand-gold flex items-center justify-center text-white shadow-xl shadow-brand-navy/20 group-hover:scale-105 transition-transform duration-500">
                <Users className="w-10 h-10" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-full bg-emerald-500" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight font-accent uppercase">{user.user_name}</h3>
              <p className="text-slate-500 font-bold mt-1.5 flex items-center gap-2">
                Senior Consultant <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 
                <span className="text-brand-gold font-black uppercase tracking-wider">{user.total_proposals} Proposals Tracked</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Efficiency Score</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-slate-900 tracking-tight tabular-nums">{user.completed_percentage}%</span>
                <div className="w-14 h-14 rounded-full border-[4px] border-emerald-500 flex items-center justify-center shadow-inner">
                  <span className="text-xs font-black text-emerald-600">A+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-10">
        {/* Visual Progress Architecture */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-2">Success Trajectory</h4>
              <p className="text-sm font-medium text-slate-500 italic">Combined completion progress across all active cycles.</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" /> Cleared
              </div>
              <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <div className="w-3 h-3 rounded-full bg-slate-200" /> Pipeline
              </div>
            </div>
          </div>
          
          <div className="relative w-full h-8 bg-slate-100 rounded-full border border-slate-200 overflow-hidden shadow-inner p-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${user.completed_percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
            >
              <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:32px_32px] animate-shimmer opacity-20" />
            </motion.div>
          </div>
        </div>

        {/* Dynamic Items Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cleared Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                  <CheckCircle className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Cleared</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Revenue Realized</p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-md">{user.completed_proposals} Items</span>
            </div>

            <div className="space-y-4">
              {user.completed_items.length > 0 ? (
                user.completed_items.slice(0, 5).map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ x: 8 }}
                    className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-3xl group transition-all duration-300 hover:shadow-md hover:border-emerald-100"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300 text-sm shadow-inner group-hover:text-emerald-500 group-hover:border-emerald-100 group-hover:bg-emerald-50/30 transition-all">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <span className="text-[15px] font-black text-slate-900 block leading-none">{item.client_name}</span>
                        <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest block italic">Engagement Verified</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[15px] font-black text-emerald-600 block leading-none tabular-nums">{formatIndianCurrency(item.proposal_amount, true, true)}</span>
                      <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mt-2 block">Settled</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                  <p className="text-slate-300 font-black uppercase tracking-widest italic">No cleared items registry</p>
                </div>
              )}
              {user.completed_items.length > 5 && (
                <button className="w-full py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-gold transition-colors border border-slate-100 rounded-2xl hover:bg-slate-50">
                  View {user.completed_items.length - 5} additional archives 
                </button>
              )}
            </div>
          </div>

          {/* Pending Section */}
          <div className="space-y-8">
             <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-brand-gold/10 text-brand-gold border border-brand-gold/20 shadow-sm">
                  <Clock className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Pipeline</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Awaiting Finalization</p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-brand-gold text-white text-[10px] font-black uppercase tracking-widest shadow-md">{user.pending_proposals} Items</span>
            </div>

            <div className="space-y-4">
              {user.pending_items.length > 0 ? (
                user.pending_items.slice(0, 5).map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ x: -8 }}
                    className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-3xl group transition-all duration-300 hover:shadow-md hover:border-brand-gold/30"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300 text-sm shadow-inner group-hover:text-brand-gold group-hover:border-brand-gold/20 group-hover:bg-brand-gold/5 transition-all">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <span className="text-[15px] font-black text-slate-900 block leading-none">{item.client_name}</span>
                        <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest block italic">Expected Clearance</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-2">
                        <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                          {item.tentative_date ? new Date(item.tentative_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBD'}
                        </span>
                      </div>
                      <span className="text-[15px] font-black text-brand-navy block leading-none tabular-nums">{formatIndianCurrency(item.proposal_amount, true, true)}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                  <p className="text-slate-300 font-black uppercase tracking-widest italic">No pending items in queue</p>
                </div>
              )}
              {user.pending_items.length > 5 && (
                <button className="w-full py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-navy transition-colors border border-slate-100 rounded-2xl hover:bg-slate-50">
                  View {user.pending_items.length - 5} additional pipeline 
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

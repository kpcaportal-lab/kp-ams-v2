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
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse">Analyzing your progress...</p>
    </div>
  );

  if (!progress) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Target className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">No progress data found</h3>
      <p className="text-slate-500 max-w-xs mt-2">We couldn't find any assignment progress associated with your account yet.</p>
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
      color: 'text-amber-600', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20',
      description: 'Items in pipeline'
    },
    { 
      label: 'Completed Value', 
      value: formatIndianCurrency(progress.completed_amount, true, true), 
      icon: IndianRupee, 
      color: 'text-blue-600', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/20',
      description: 'Realized revenue'
    },
    { 
      label: 'Pipeline Value', 
      value: formatIndianCurrency(progress.pending_amount, true, true), 
      icon: Target, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-500/10', 
      border: 'border-indigo-500/20',
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-none">Performance Insights</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tightest leading-tight">
              My Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Progress</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-2xl">
              Strategic overview of your engagement completion and revenue trajectory.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-5 py-4 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assignments</p>
              <p className="text-2xl font-black text-slate-900">{progress.total_proposals}</p>
            </div>
          </div>
        </div>
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />
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
              "relative group p-6 rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-white/60 shadow-glass transition-all duration-500 hover:shadow-skylight hover:-translate-y-1 overflow-hidden"
            )}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("p-3 rounded-2xl", kpi.bg)}>
                  <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{kpi.description}</p>
              </div>
            </div>
            
            {/* Hover reflection effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
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
    <div className="relative overflow-hidden rounded-[3rem] bg-white/60 backdrop-blur-2xl border border-white/60 shadow-glass border-b-white/20">
      {/* Card Header */}
      <div className="p-10 border-b border-slate-100/60 bg-gradient-to-b from-white/40 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-500">
                <Users className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-full bg-emerald-500" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{user.user_name}</h3>
              <p className="text-slate-500 font-bold mt-1.5 flex items-center gap-2">
                Senior Consultant <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> 
                <span className="text-blue-600">{user.total_proposals} Proposals Tracked</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Efficiency Score</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{user.completed_percentage}%</span>
                <div className="w-12 h-12 rounded-full border-[3px] border-emerald-500 flex items-center justify-center">
                  <span className="text-[10px] font-black text-emerald-600">A+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-10">
        {/* Visual Progress Architecture */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Success Trajectory</h4>
              <p className="text-sm font-medium text-slate-500">Combined completion progress across all active cycles.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cleared
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Pipeline
              </div>
            </div>
          </div>
          
          <div className="relative w-full h-6 bg-slate-100/80 rounded-full border border-slate-100 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${user.completed_percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:32px_32px] animate-shimmer opacity-20" />
            </motion.div>
          </div>
        </div>

        {/* Dynamic Items Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cleared Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">Cleared Proposals</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue Realized</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">{user.completed_proposals} Items</span>
            </div>

            <div className="space-y-3">
              {user.completed_items.length > 0 ? (
                user.completed_items.slice(0, 5).map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-5 bg-white/40 border border-slate-100/60 rounded-3xl group transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-sm group-hover:text-emerald-500 group-hover:border-emerald-100 transition-colors">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-900 block leading-none">{item.client_name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest block">Engagement Verified</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600 block leading-none">{formatIndianCurrency(item.proposal_amount, true, true)}</span>
                      <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mt-1">Paid Status</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 font-bold italic">No cleared items yet</p>
                </div>
              )}
              {user.completed_items.length > 5 && (
                <button className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                  View {user.completed_items.length - 5} additional items 
                </button>
              )}
            </div>
          </div>

          {/* Pending Section */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">Active Pipeline</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">{user.pending_proposals} Items</span>
            </div>

            <div className="space-y-3">
              {user.pending_items.length > 0 ? (
                user.pending_items.slice(0, 5).map((item, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ x: -5 }}
                    className="flex justify-between items-center p-5 bg-white/40 border border-slate-100/60 rounded-3xl group transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-sm group-hover:text-amber-500 group-hover:border-amber-100 transition-colors">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-900 block leading-none">{item.client_name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest block">Expected Clearance</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end mb-1">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase">
                          {item.tentative_date ? new Date(item.tentative_date).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <span className="text-sm font-black text-blue-600 block leading-none">{formatIndianCurrency(item.proposal_amount, true, true)}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 font-bold italic">No pending items</p>
                </div>
              )}
              {user.pending_items.length > 5 && (
                <button className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                  View {user.pending_items.length - 5} additional items 
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

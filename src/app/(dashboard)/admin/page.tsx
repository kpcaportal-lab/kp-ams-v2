'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Shield, Activity, Clock, Users, FileText, AlertTriangle,
  Search, RefreshCw, ChevronLeft, ChevronRight,
  LogIn, Edit, Trash, Eye, Plus, Download, X, Globe, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '@/lib/api';
import { cn } from '@/lib/utils';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

interface ActiveUser {
  id: string;
  full_name: string;
  display_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_active: string | null;
  last_action: string | null;
  total_actions_today: number;
}

interface AuditStats {
  loginsByDay: Array<{ date: string; logins: number }>;
  actionBreakdown: Array<{ action: string; count: number }>;
  topUsers: Array<{ full_name: string; role: string; actions: number }>;
}

const actionIcons: Record<string, typeof LogIn> = {
  login: LogIn, create: Plus, update: Edit, delete: Trash, view: Eye, export: Download,
};

const actionColors: Record<string, string> = {
  login: '#1e3a5f', // Navy
  create: '#d4a574', // Gold
  update: '#1e3a5f',
  delete: '#be123c', // Maintain red for destructive
  view: '#64748b',
  export: '#d4a574',
};

/* Removed unused actionTooltips */

const roleColors: Record<string, string> = {
  admin: 'var(--brand-navy)',
  partner: 'var(--brand-red)',
  director: 'var(--brand-navy)',
  manager: '#475569',
};

export default function AdminPage() {
  const { user, loginAs } = useAuthStore();
  const router = useRouter();

  const handleImpersonateUser = async (userId: string) => {
    try {
      await loginAs(userId);
      router.push('/dashboard');
    } catch (err) {
      console.error('Impersonation failed:', err);
      alert('Failed to impersonate user');
    }
  };
  const [activeTab, setActiveTab] = useState<'logs' | 'users' | 'stats'>('logs');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Role guard
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (searchTerm) params.set('search', searchTerm);
      if (actionFilter) params.set('action', actionFilter);
      const res = await api.get(`/api/audit/logs?${params}`);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, searchTerm, actionFilter]);

  const fetchActiveUsers = useCallback(async () => {
    try {
      const res = await api.get('/api/audit/active-users');
      setActiveUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/api/audit/stats');
      setStats(res.data || null);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (activeTab === 'logs') await fetchLogs();
      if (activeTab === 'users') await fetchActiveUsers();
      if (activeTab === 'stats') await fetchStats();
    };
    if (isMounted) load();
    return () => { isMounted = false; };
  }, [activeTab, fetchLogs, fetchActiveUsers, fetchStats]);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid Date';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Removed unused 'now' variable

  if (user && user.role !== 'admin') return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-navy flex items-center justify-center shadow-[0_8px_20px_rgba(30,58,95,0.2)] border border-slate-800">
            <Shield size={28} className="text-brand-red" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-accent">
              Admin <span className="text-brand-red">Intelligence</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium italic">Secure oversight of system monitoring, audit logs, and mission activity.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Systems Nominal</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/60 backdrop-blur-md rounded-[1.5rem] p-1.5 border border-slate-200 w-fit shadow-sm">
        {[
          { key: 'logs' as const, label: 'Audit Intelligence', icon: FileText },
          { key: 'users' as const, label: 'Session Monitor', icon: Globe },
          { key: 'stats' as const, label: 'Systems Analytics', icon: Activity },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-[1.25rem] text-sm font-extrabold transition-all duration-300 uppercase tracking-widest",
              activeTab === tab.key
                ? "bg-brand-navy text-brand-white shadow-[0_10px_20px_rgba(30,58,95,0.2)]"
                : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <tab.icon size={16} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* -- Tab: Audit Logs -- */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" />
              <input
                type="text"
                placeholder="Search audit trail by email or entity..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red/30 transition-all shadow-sm"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="px-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red/30 transition-all shadow-sm min-w-[180px] cursor-pointer appearance-none uppercase tracking-widest"
            >
              <option value="">All Directives</option>
              <option value="login">Login</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
            </select>
            <button
              onClick={() => fetchLogs()}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-extrabold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm uppercase tracking-widest"
            >
              <RefreshCw size={16} />
              Re-Sync
            </button>
          </div>

          {/* Logs Table */}
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            {loading ? (
              <LoadingScreen message="Scanning audit intelligence" submessage="Accessing the neural core" />
            ) : logs.length === 0 ? (
              <div className="px-8 py-20 text-center">
                <AlertTriangle size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-slate-500 font-medium italic">No mission records found in current database.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-white bg-brand-navy border-b border-white/5 uppercase tracking-[0.2em] rounded-tl-[1.5rem]">Timeline</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-white bg-brand-navy border-b border-white/5 uppercase tracking-[0.2em]">Operator</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-white bg-brand-navy border-b border-white/5 uppercase tracking-[0.2em]">Clearance</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-white bg-brand-navy border-b border-white/5 uppercase tracking-[0.2em]">Directive</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-white bg-brand-navy border-b border-white/5 uppercase tracking-[0.2em]">Entity</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-white bg-brand-navy border-b border-white/5 uppercase tracking-[0.2em]">Source IP</th>
                    <th className="px-8 py-5 text-right font-extrabold text-white bg-brand-navy border-b border-white/5 rounded-tr-[1.5rem]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {logs.map(log => {
                    const IconComp = actionIcons[log.action] || Eye;
                    const color = actionColors[log.action] || '#888';
                    return (
                      <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                            <Clock size={12} className="text-slate-400" />
                            {formatTime(log.created_at)}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="text-[15px] font-bold text-slate-900 group-hover:text-brand-navy transition-colors">
                            {log.user_name || log.user_email}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400">{log.user_email}</div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border",
                            log.user_role === 'admin' ? "bg-brand-navy/5 text-brand-navy border-brand-navy/10" :
                              log.user_role === 'partner' ? "bg-brand-red/5 text-brand-red border-brand-red/10" :
                                "bg-slate-50 text-slate-500 border-slate-200"
                          )}>
                            {log.user_role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-tight"
                            style={{ background: `${color}10`, color }}>
                            <IconComp size={12} strokeWidth={2.5} />
                            {log.action}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-[13px] font-medium text-slate-600">
                          {log.entity_type || '—'}
                        </td>
                        <td className="px-8 py-4 text-[12px] font-mono text-slate-400">
                          {log.ip_address || '—'}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-extrabold text-slate-600 hover:bg-white hover:border-brand-navy/30 hover:text-brand-navy transition-all active:scale-95 uppercase tracking-widest"
                          >
                            <Eye size={14} /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: 12, padding: 16, borderTop: '1px solid var(--border)'
              }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
                    borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)',
                    color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
                  }}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
                    borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)',
                    color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Tab: Users (Session Monitor) -- */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeUsers.map((u, i) => {
            const lastActiveTime = u.last_active || '';
            const isOnlineRecently = new Date(lastActiveTime).getTime() > currentTime - 5 * 60 * 1000;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-brand-navy/5 hover:border-brand-navy/10 transition-all duration-300 overflow-hidden"
              >
                {isOnlineRecently && (
                  <div className="absolute top-0 right-0 px-5 py-2 bg-emerald-50 text-emerald-600 text-[9px] font-extrabold uppercase tracking-[0.2em] rounded-bl-2xl border-l border-b border-emerald-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Signal
                  </div>
                )}

                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-brand-navy flex items-center justify-center text-brand-red text-2xl font-extrabold shadow-[0_8px_20px_rgba(30,58,95,0.2)]">
                      {(u.display_name || u.full_name).charAt(0)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                      isOnlineRecently ? "bg-emerald-500 shadow-emerald-200" : "bg-slate-300"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-slate-900 font-accent truncate leading-tight">
                      {u.display_name || u.full_name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <div>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Last Intel</p>
                    <p className="text-xs font-extrabold text-brand-navy truncate">
                      {u.last_action ? (
                        <span className="flex items-center gap-1">
                          {u.last_action}
                        </span>
                      ) : 'Idle Mission'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Daily Cycles</p>
                    <p className="text-xs font-extrabold text-slate-700">
                      {u.total_actions_today} <span className="text-[10px] text-slate-400 font-medium lowercase">actions</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 italic">
                    <Clock size={12} className="text-slate-300" />
                    {formatTime(u.last_active)}
                  </div>
                  <button
                    onClick={() => handleImpersonateUser(u.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-brand-red text-[10px] font-extrabold uppercase tracking-widest shadow-[0_10px_20px_rgba(30,58,95,0.2)] hover:bg-slate-800 transition-all active:scale-95 group-hover:px-6"
                  >
                    <LogIn size={14} strokeWidth={2.5} /> Impersonate
                  </button>
                </div>
              </motion.div>
            );
          })}
          {activeUsers.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm">
              <Database size={48} className="mx-auto mb-4 text-slate-100" />
              <p className="text-slate-400 font-bold italic">No active session signals detected in current window.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* -- Tab: Statistics (Systems Analytics) -- */}
      {activeTab === 'stats' && stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Login Intelligence */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-extrabold text-slate-900 font-accent flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy">
                  <LogIn size={18} strokeWidth={2.5} />
                </div>
                Login <span className="text-brand-red">Intelligence</span>
              </h3>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Last 7 Days</div>
            </div>

            <div className="flex items-end gap-3 h-48 mb-6">
              {stats.loginsByDay.map(day => {
                const maxLogins = Math.max(...stats.loginsByDay.map(d => Number(d.logins)), 1);
                const height = (Number(day.logins) / maxLogins) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group">
                    <div className="w-full bg-slate-50 rounded-t-xl relative overflow-hidden flex flex-col justify-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full bg-gradient-to-t from-brand-navy to-brand-navy/80 group-hover:from-brand-red group-hover:to-brand-red/80 transition-colors duration-500 rounded-t-lg relative"
                      >
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.logins}
                        </div>
                      </motion.div>
                    </div>
                    <div className="mt-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">
                      {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Frequency */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-lg font-extrabold text-slate-900 font-accent flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy">
                  <Activity size={18} strokeWidth={2.5} />
                </div>
                Action <span className="text-brand-red">Frequency</span>
              </h3>
              <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">Live Today</div>
            </div>

            <div className="space-y-6">
              {stats.actionBreakdown.map(ab => {
                const color = actionColors[ab.action] || '#888';
                const maxCount = Math.max(...stats.actionBreakdown.map(a => Number(a.count)), 1);
                const width = (Number(ab.count) / maxCount) * 100;
                return (
                  <div key={ab.action} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700" style={{ color }}>{ab.action}</span>
                      <span className="text-[11px] font-extrabold text-slate-900">{ab.count}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
              {stats.actionBreakdown.length === 0 && (
                <div className="text-center py-4 text-slate-500 text-sm italic">No actions recorded today</div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Users size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Most Active Users Today
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {stats.topUsers.map((tu, i) => (
                <div key={i} style={{
                  padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
                  background: i === 0 ? 'var(--bg-primary-light)' : 'transparent'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{tu.full_name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                      color: roleColors[tu.role] || '#888'
                    }}>{tu.role}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                      {tu.actions} actions
                    </span>
                  </div>
                </div>
              ))}
              {stats.topUsers.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20, gridColumn: 'span 2' }}>
                  No user activity today
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      {/* Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
              onClick={() => setSelectedLog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-accent tracking-tight">Audit <span className="text-brand-red">Intelligence</span></h3>
                  <div className="text-xs font-bold text-slate-400 mt-1 italic">
                    Recorded at {formatTime(selectedLog.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2.5 rounded-full hover:bg-slate-200 transition-colors text-slate-400"
                >
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Operator</p>
                    <p className="text-sm font-extrabold text-slate-900">{selectedLog.user_name || selectedLog.user_email}</p>
                    <p className="text-[11px] font-bold text-brand-red uppercase mt-0.5 tracking-wider">{selectedLog.user_role}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Directive</p>
                    <p className="text-sm font-extrabold uppercase tracking-tight" style={{ color: actionColors[selectedLog.action] || '#1e3a5f' }}>
                      {selectedLog.action}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Intel Entity</p>
                    <p className="text-sm font-extrabold text-slate-800">{selectedLog.entity_type} {selectedLog.entity_id ? `(#${selectedLog.entity_id.substring(0, 8)})` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Digital Signature</p>
                    <p className="text-sm font-mono text-slate-500 font-bold">{selectedLog.ip_address}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">
                    {selectedLog.action === 'update' ? 'Comparative Analysis' : 'Intel Payload'}
                  </p>
                  <RenderLogDetails details={selectedLog.details} action={selectedLog.action} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RenderLogDetails({ details, action }: { details: Record<string, any>, action: string }) {
  if (action === 'update' && details.changedFields && typeof details.changedFields === 'object') {
    const fields = Object.keys(details.changedFields);
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 font-extrabold text-slate-400 uppercase tracking-widest w-1/3">Field</th>
              <th className="px-6 py-4 font-extrabold text-slate-400 uppercase tracking-widest">Previous</th>
              <th className="px-6 py-4 font-extrabold text-slate-400 uppercase tracking-widest">Terminal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {fields.map(field => {
              const diff = details.changedFields[field];
              return (
                <tr key={field} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 font-extrabold text-slate-700">{field}</td>
                  <td className="px-6 py-4 text-rose-500 font-medium line-through decoration-rose-500/30">
                    {String(diff.old ?? '—')}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-bold bg-emerald-50/30">
                    {String(diff.new ?? '—')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Database size={100} className="text-brand-red" />
      </div>
      <pre className="relative z-10 text-[13px] font-mono text-brand-red/90 leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(details, null, 2)}
      </pre>
    </div>
  );
}

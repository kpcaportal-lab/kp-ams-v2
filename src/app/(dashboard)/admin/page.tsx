'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Shield, Activity, Clock, Users, FileText, AlertTriangle,
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  LogIn, Edit, Trash, Eye, Plus, Download, X
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
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
  login: '#10b981', create: '#3b82f6', update: '#f59e0b',
  delete: '#ef4444', view: '#8b5cf6', export: '#06b6d4',
};

const actionTooltips: Record<string, string> = {
  login: 'User logged into the system',
  create: 'A new record was created',
  update: 'An existing record was modified',
  delete: 'A record was removed',
  view: 'A record was viewed or accessed',
  export: 'Data was exported or downloaded',
};

const roleColors: Record<string, string> = {
  admin: '#ef4444', partner: '#3b82f6', director: '#f59e0b', manager: '#10b981',
};

export default function AdminPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
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

  // Role guard
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (searchTerm) params.set('search', searchTerm);
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`${API}/api/audit/logs?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, searchTerm, actionFilter, token]);

  const fetchActiveUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/audit/active-users`, { headers });
      if (res.ok) setActiveUsers(await res.json());
    } catch (err) { console.error(err); }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/audit/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'users') fetchActiveUsers();
    if (activeTab === 'stats') fetchStats();
  }, [activeTab, fetchLogs, fetchActiveUsers, fetchStats]);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (user?.role !== 'admin') return null;

  return (
    <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Shield size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Admin Panel
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
            System monitoring, audit logs & user activity
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 14,
        padding: 4, marginBottom: 24, border: '1px solid var(--border)', width: 'fit-content'
      }}>
        {[
          { key: 'logs' as const, label: 'Audit Logs', icon: FileText },
          { key: 'users' as const, label: 'Active Users', icon: Users },
          { key: 'stats' as const, label: 'Statistics', icon: Activity },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600,
              fontSize: '0.875rem', transition: 'all 0.2s ease',
              background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Audit Logs ── */}
      {activeTab === 'logs' && (
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by email or entity..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none'
                }}
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              style={{
                padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem',
                cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
            </select>
            <button
              onClick={() => fetchLogs()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem'
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Logs Table */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading audit logs...
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertTriangle size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ margin: 0 }}>No audit logs found</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'User', 'Role', 'Action', 'Entity', 'IP', ''].map(h => (
                      <th key={h} style={{
                        padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem',
                        fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const IconComp = actionIcons[log.action] || Eye;
                    const color = actionColors[log.action] || '#888';
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          {formatTime(log.created_at)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {log.user_name || log.user_email}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user_email}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem',
                            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                            background: `${roleColors[log.user_role] || '#888'}18`,
                            color: roleColors[log.user_role] || '#888'
                          }}>{log.user_role}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            title={actionTooltips[log.action] || log.action}
                            style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem',
                            fontWeight: 600, background: `${color}15`, color
                          }}>
                            <IconComp size={13} />
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {log.entity_type || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {log.ip_address || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedLog(log)}
                            style={{
                              background: 'transparent', border: '1px solid var(--border)',
                              padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem',
                              fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 6
                            }}
                          >
                            <Eye size={12} /> Details
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

      {/* ── Tab: Active Users ── */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {activeUsers.map(u => {
            const isOnlineRecently = u.last_active && (Date.now() - new Date(u.last_active).getTime()) < 15 * 60 * 1000;
            return (
              <div key={u.id} style={{
                background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
                padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'box-shadow 0.2s ease'
              }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Status indicator */}
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: isOnlineRecently ? '#10b981' : '#94a3b8',
                    boxShadow: isOnlineRecently ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
                  }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {u.display_name || u.full_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.7rem',
                    fontWeight: 700, textTransform: 'uppercase',
                    background: `${roleColors[u.role] || '#888'}18`,
                    color: roleColors[u.role] || '#888'
                  }}>{u.role}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {u.last_action || 'No activity'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatTime(u.last_active)}
                    </div>
                  </div>
                  <div style={{
                    minWidth: 50, textAlign: 'center', padding: '6px 12px',
                    borderRadius: 10, background: 'var(--bg-primary-light)',
                    color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem'
                  }}>
                    {u.total_actions_today}
                    <div style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.7 }}>today</div>
                  </div>
                </div>
              </div>
            );
          })}
          {activeUsers.length === 0 && (
            <div style={{
              padding: 60, textAlign: 'center', color: 'var(--text-muted)',
              background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)'
            }}>
              No user activity data available yet
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Statistics ── */}
      {activeTab === 'stats' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          {/* Login Chart */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
            padding: 24
          }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              <LogIn size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Logins (Last 7 Days)
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
              {stats.loginsByDay.map(day => {
                const maxLogins = Math.max(...stats.loginsByDay.map(d => Number(d.logins)), 1);
                const height = (Number(day.logins) / maxLogins) * 100;
                return (
                  <div key={day.date} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: `${Math.max(height, 5)}%`, background: 'linear-gradient(180deg, #3b82f6, #2563eb)',
                      borderRadius: '6px 6px 0 0', minHeight: 4, transition: 'height 0.3s ease'
                    }} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {day.logins}
                    </div>
                  </div>
                );
              })}
              {stats.loginsByDay.length === 0 && (
                <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>
                  No login data yet
                </div>
              )}
            </div>
          </div>

          {/* Action Breakdown */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
            padding: 24
          }}>
            <h3 style={{ margin: '0 0 20px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Activity size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Today&apos;s Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.actionBreakdown.map(ab => {
                const color = actionColors[ab.action] || '#888';
                const maxCount = Math.max(...stats.actionBreakdown.map(a => Number(a.count)), 1);
                const width = (Number(ab.count) / maxCount) * 100;
                return (
                  <div key={ab.action} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 70, fontSize: '0.8rem', fontWeight: 600,
                      color, textTransform: 'capitalize'
                    }}>{ab.action}</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-card-hover)', borderRadius: 4 }}>
                      <div style={{
                        width: `${width}%`, height: '100%', background: color,
                        borderRadius: 4, transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 30, textAlign: 'right' }}>
                      {ab.count}
                    </span>
                  </div>
                );
              })}
              {stats.actionBreakdown.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                  No activity today
                </div>
              )}
            </div>
          </div>

          {/* Top Users */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
            padding: 24, gridColumn: 'span 2'
          }}>
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
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>
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
        </div>
      )}
      {/* Log Details Modal */}
      {selectedLog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setSelectedLog(null)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
            width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Audit Log Details
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {formatTime(selectedLog.created_at)}
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 8, borderRadius: '50%', display: 'flex'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: 24, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>User</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedLog.user_name || selectedLog.user_email}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedLog.user_role}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Action</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: actionColors[selectedLog.action] || 'var(--text-primary)' }}>
                    {selectedLog.action}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Entity</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedLog.entity_type} {selectedLog.entity_id ? `(${selectedLog.entity_id.substring(0,8)}...)` : ''}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>IP Address</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedLog.ip_address}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12 }}>
                {selectedLog.action === 'update' ? 'Changes Detected' : 'Payload Details'}
              </div>
              
              <RenderLogDetails details={selectedLog.details} action={selectedLog.action} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RenderLogDetails({ details, action }: { details: any, action: string }) {
  if (action === 'update' && details.changedFields && typeof details.changedFields === 'object') {
    const fields = Object.keys(details.changedFields);
    return (
      <div style={{ 
        background: 'var(--bg-primary-light)', borderRadius: 12, border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-muted)', width: '30%' }}>Field</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-muted)' }}>Old Value</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-muted)' }}>New Value</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(field => {
              const diff = details.changedFields[field];
              return (
                <tr key={field} style={{ borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{field}</td>
                  <td style={{ padding: '10px 16px', color: '#ef4444', wordBreak: 'break-all' }}>
                    {String(diff.old ?? 'None/Empty')}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#10b981', wordBreak: 'break-all' }}>
                    {String(diff.new ?? 'None/Empty')}
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
    <div style={{ 
      background: 'var(--bg-primary-light)', padding: 16, borderRadius: 12, 
      border: '1px solid var(--border)', overflowX: 'auto' 
    }}>
      <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
        {JSON.stringify(details, null, 2)}
      </pre>
    </div>
  );
}

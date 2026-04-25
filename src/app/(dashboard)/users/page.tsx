'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn, getErrorMessage } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, Shield, Mail, MoreVertical,
  User, CheckCircle, Plus, ArrowUpRight, Edit3,
  Users, Activity, Briefcase, Key, Filter
} from 'lucide-react';
import api from '@/lib/api';
import type { User as UserType, UserRole } from '@/types';
import toast from 'react-hot-toast';
import AddUserModal from '@/components/modals/AddUserModal';
import EditUserModal from '@/components/modals/EditUserModal';
import { useAuthStore } from '@/store/authStore';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

export default function UsersPage() {
  const [profiles, setProfiles] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const { user: currentUser } = useAuthStore();
  const router = useRouter();
  const isAdmin = currentUser?.role === 'admin';
  const canManageUsers = ['admin', 'partner', 'director'].includes(currentUser?.role || '');

  useEffect(() => {
    if (currentUser && !canManageUsers) {
      router.push('/dashboard');
    }
  }, [currentUser, canManageUsers, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users');
      setProfiles(res.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = {
    total: profiles.length,
    active: profiles.filter(u => u.is_active !== false).length,
    admins: profiles.filter(u => u.role === 'admin').length,
    partners: profiles.filter(u => u.role === 'partner' || u.role === 'director').length,
    staff: profiles.filter(u => ['manager', 'assistant_manager', 'sr_executive', 'executive', 'staff', 'analyst'].includes(u.role)).length
  };

  const filtered = profiles.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                         u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleConfig: Record<UserRole, { color: string, bg: string, border: string, icon: any }> = {
    admin: { color: '#0ea5e9', bg: '#0ea5e910', border: '#0ea5e930', icon: Key },
    partner: { color: '#8b5cf6', bg: '#8b5cf610', border: '#8b5cf630', icon: Shield },
    director: { color: '#f59e0b', bg: '#f59e0b10', border: '#f59e0b30', icon: Briefcase },
    manager: { color: '#10b981', bg: '#10b98110', border: '#10b98130', icon: CheckCircle },
    assistant_manager: { color: '#14b8a6', bg: '#14b8a610', border: '#14b8a630', icon: CheckCircle },
    sr_executive: { color: '#6366f1', bg: '#6366f110', border: '#6366f130', icon: User },
    executive: { color: '#a855f7', bg: '#a855f710', border: '#a855f730', icon: User },
    analyst: { color: '#ec4899', bg: '#ec489910', border: '#ec489930', icon: Activity },
    staff: { color: '#64748b', bg: '#64748b10', border: '#64748b30', icon: User }
  };

  const roleStyles: Record<UserRole, string> = {
    admin: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    partner: 'bg-blue-50 text-blue-700 border-blue-200',
    director: 'bg-amber-50 text-amber-700 border-amber-200',
    manager: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    assistant_manager: 'bg-teal-50 text-teal-700 border-teal-200',
    sr_executive: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    executive: 'bg-violet-50 text-violet-700 border-violet-200',
    analyst: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    staff: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto p-4 sm:p-8">
      {/* ── Header Area ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600">
              <Users size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          </div>
          <p className="text-slate-500 font-medium">Coordinate your team, manage permissions, and control access levels.</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={20} />
            Add New Member
          </button>
        )}
      </div>

      {/* ── Stats Landing Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Members', val: stats.total, icon: Users, color: '#3b82f6' },
          { label: 'Active Now', val: stats.active, icon: Activity, color: '#10b981' },
          { label: 'Administrators', val: stats.admins, icon: Shield, color: '#0ea5e9' },
          { label: 'Partners/Directors', val: stats.partners, icon: Briefcase, color: '#8b5cf6' },
          { label: 'Staff & Ops', val: stats.staff, icon: CheckCircle, color: '#f59e0b' },
        ].map((s, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={s.label}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ background: `${s.color}10`, color: s.color }}>
                <s.icon size={18} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 line-height-1">{s.val}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar: Search & Filters ── */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 p-2 rounded-2xl border border-slate-200/60 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or designation..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              {Object.keys(roleConfig).map(r => (
                <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchUsers}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
          >
            <Activity size={18} />
          </button>
        </div>
      </div>

      {/* ── Users Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((user, i) => {
            const config = roleConfig[user.role as UserRole] || roleConfig.staff;
            return (
              <motion.div
                layout
                key={user.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group relative bg-white rounded-3xl border border-slate-200 p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                {/* Status indicator absolute */}
                <div className={cn(
                  "absolute top-5 right-5 w-2.5 h-2.5 rounded-full ring-4 ring-white",
                  user.is_active ? "bg-emerald-500" : "bg-slate-300"
                )} />

                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-black text-2xl shadow-inner group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500">
                      {user.full_name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {user.full_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border"
                      style={{ background: config.bg, color: config.color, borderColor: config.border }}
                    >
                      <config.icon size={12} />
                      {user.role.replace('_', ' ')}
                    </div>
                    {!user.is_active && (
                      <div className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-widest">
                        Deactivated
                      </div>
                    )}
                  </div>

                  {user.reports_to_name && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-400">
                        <ArrowUpRight size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Direct Report</span>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-tight truncate">{user.reports_to_name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">
                    Member Since<br />
                    <span className="text-slate-600 text-[11px] font-black leading-tight">
                      {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {isAdmin && user.id !== currentUser?.id && (
                      <button 
                        onClick={async () => {
                          if (confirm(`Impersonate ${user.full_name}?`)) {
                            try {
                              await useAuthStore.getState().loginAs(user.id);
                              window.location.href = '/dashboard';
                            } catch (err) {
                              toast.error(getErrorMessage(err));
                            }
                          }
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 transition-all hover:-translate-y-0.5"
                        title="Impersonate User"
                      >
                        <User size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-all hover:-translate-y-0.5"
                      title="Edit Profile"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 flex flex-col items-center text-center px-6 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200"
        >
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-300 shadow-sm mb-6 border border-slate-100">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No matching members found</h3>
          <p className="text-slate-500 font-medium max-w-sm">We couldn&apos;t find any team members matching your search criteria or role filters.</p>
          <button 
            onClick={() => { setSearch(''); setRoleFilter('all'); }}
            className="mt-8 text-blue-600 font-black text-sm uppercase tracking-widest hover:underline"
          >
             Clear all filters
          </button>
        </motion.div>
      )}

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchUsers}
          user={selectedUser}
        />
      )}
    </div>
  );
}

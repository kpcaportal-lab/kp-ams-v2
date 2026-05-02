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
import LoadingScreen from '@/components/ui/LoadingScreen';

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

  useEffect(() => {
    if (currentUser && !isAdmin) {
      router.push('/dashboard');
    }
  }, [currentUser, isAdmin, router]);

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

  const roleOrder: Record<UserRole, number> = {
    admin: 1,
    partner: 2,
    director: 3,
    manager: 4,
    assistant_manager: 5,
    sr_executive: 6,
    executive: 7,
    analyst: 8,
    staff: 9
  };

  const filtered = profiles.filter(u => {
    const fullName = u.full_name || '';
    const email = u.email || '';
    const matchesSearch = fullName.toLowerCase().includes(search.toLowerCase()) ||
                         email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    const orderA = roleOrder[a.role] ?? 99;
    const orderB = roleOrder[b.role] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  const roleConfig: Record<UserRole, { color: string, bg: string, border: string, icon: any }> = {
    admin: { color: 'var(--brand-red)', bg: 'rgba(30, 58, 95, 0.05)', border: 'rgba(30, 58, 95, 0.1)', icon: Key },
    partner: { color: 'var(--brand-navy)', bg: 'rgba(220, 38, 38, 0.1)', border: 'rgba(220, 38, 38, 0.2)', icon: Shield },
    director: { color: 'var(--brand-navy)', bg: 'rgba(220, 38, 38, 0.05)', border: 'rgba(220, 38, 38, 0.1)', icon: Briefcase },
    manager: { color: '#1e3a5f', bg: 'rgba(30, 58, 95, 0.03)', border: 'rgba(30, 58, 95, 0.08)', icon: CheckCircle },
    assistant_manager: { color: '#1e3a5f', bg: 'rgba(30, 58, 95, 0.03)', border: 'rgba(30, 58, 95, 0.08)', icon: CheckCircle },
    sr_executive: { color: '#475569', bg: 'rgba(71, 85, 105, 0.03)', border: 'rgba(71, 85, 105, 0.08)', icon: User },
    executive: { color: '#475569', bg: 'rgba(71, 85, 105, 0.03)', border: 'rgba(71, 85, 105, 0.08)', icon: User },
    analyst: { color: '#475569', bg: 'rgba(71, 85, 105, 0.03)', border: 'rgba(71, 85, 105, 0.08)', icon: Activity },
    staff: { color: '#64748b', bg: 'rgba(100, 116, 139, 0.03)', border: 'rgba(100, 116, 139, 0.08)', icon: User }
  };

  const roleStyles: Record<UserRole, string> = {
    admin: 'bg-brand-navy text-brand-red border-brand-navy/20',
    partner: 'bg-brand-red/10 text-brand-navy border-brand-red/20',
    director: 'bg-brand-red/5 text-brand-navy border-brand-red/10',
    manager: 'bg-slate-50 text-brand-navy border-slate-200',
    assistant_manager: 'bg-slate-50 text-brand-navy border-slate-200',
    sr_executive: 'bg-slate-50 text-slate-700 border-slate-200',
    executive: 'bg-slate-50 text-slate-700 border-slate-200',
    analyst: 'bg-slate-50 text-slate-700 border-slate-200',
    staff: 'bg-slate-50 text-slate-600 border-slate-200'
  };

  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (loading) return (
    <LoadingScreen message="Loading team intelligence" submessage="Syncing access credentials" />
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-none uppercase">
            Team <span className="text-brand-red">& Personnel</span>
          </h1>
          <p className="text-slate-500 mt-1 font-bold uppercase text-[10px] tracking-widest">Institutional Human Capital & Access Control</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 rounded-none bg-brand-navy text-white text-[10px] font-extrabold transition-all border-b-2 border-brand-red active:scale-95 uppercase tracking-widest"
          >
            <Plus size={16} strokeWidth={3} className="text-white" />
            Enroll New Member
          </button>
        )}
      </div>

      {/* Stats Landing Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-0">
        {[
          { label: 'Total Members', val: stats.total, icon: Users, color: 'text-brand-navy', bg: 'bg-brand-navy/5' },
          { label: 'Active Now', val: stats.active, icon: Activity, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Administrators', val: stats.admins, icon: Shield, color: 'text-brand-navy', bg: 'bg-slate-100' },
          { label: 'Partners/Directors', val: stats.partners, icon: Briefcase, color: 'text-brand-navy', bg: 'bg-slate-100' },
          { label: 'Staff & Ops', val: stats.staff, icon: CheckCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((s, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={s.label}
            className="bg-white p-6 rounded-none border border-slate-200 shadow-none transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-2 rounded-none transition-transform", s.bg, s.color)}>
                <s.icon size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tighter">{s.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 px-4 sm:px-0">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-navy transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or designation..."
            className="w-full bg-white border border-slate-200 rounded-none pl-11 pr-4 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-brand-navy transition-all shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-navy" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-none pl-10 pr-10 py-4 text-[10px] font-extrabold text-slate-700 focus:outline-none focus:border-brand-navy transition-all outline-none appearance-none cursor-pointer shadow-none uppercase tracking-widest"
            >
              <option value="all">All Roles</option>
              {Object.keys(roleConfig).map(r => (
                <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchUsers}
            className="px-5 bg-white border border-slate-200 rounded-none text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-all shadow-none active:scale-95"
          >
            <Activity size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {filtered.map((user, i) => {
            const config = roleConfig[user.role as UserRole] || roleConfig.staff;
            return (
              <motion.div
                layout
                key={user.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group relative bg-white rounded-none border border-slate-200 p-8 hover:border-brand-navy/30 hover:bg-slate-50/30 transition-all duration-300 shadow-none"
              >
                {/* Status indicator absolute */}
                <div className={cn(
                  "absolute top-6 right-6 w-3 h-3 rounded-none border border-white shadow-none",
                  user.is_active ? "bg-emerald-600" : "bg-slate-300"
                )} title={user.is_active ? "Active" : "Inactive"} />

                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-none bg-brand-navy text-white flex items-center justify-center font-extrabold text-2xl border border-brand-navy transition-transform duration-500">
                      {(user.full_name || 'U').charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase group-hover:text-brand-navy transition-colors">
                      {user.full_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mt-0.5">
                      <Mail size={12} strokeWidth={3} className="text-brand-navy/40" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-4 py-2 rounded-none bg-brand-navy text-white text-[9px] font-extrabold uppercase tracking-[0.2em] border border-brand-navy flex items-center gap-2 shadow-none">
                      <config.icon size={12} strokeWidth={3} className="text-white" />
                      {user.role.replace('_', ' ')}
                    </div>
                    {!user.is_active && (
                      <div className="px-4 py-2 rounded-none bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-extrabold uppercase tracking-widest">
                        Deactivated
                      </div>
                    )}
                  </div>

                  {user.reports_to_name && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-none group-hover:bg-white transition-colors">
                      <div className="p-1.5 bg-white rounded-none border border-slate-200 text-brand-navy shadow-none">
                        <ArrowUpRight size={14} strokeWidth={3} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Supervisory Entity</span>
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-tight truncate">{user.reports_to_name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] leading-tight">
                    Enrolled Date<br />
                    <span className="text-brand-navy text-xs font-extrabold tracking-normal uppercase">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && user.id !== currentUser?.id && (
                      <button 
                        onClick={async () => {
                          if (confirm(`Authorize impersonation for ${user.full_name}?`)) {
                            try {
                              await useAuthStore.getState().loginAs(user.id);
                              window.location.href = '/dashboard';
                            } catch (err) {
                              toast.error(getErrorMessage(err));
                            }
                          }
                        }}
                        className="p-3 rounded-none bg-white text-slate-400 hover:bg-slate-100 hover:text-brand-navy border border-slate-200 transition-all active:scale-95"
                        title="Impersonate User"
                      >
                        <User size={18} strokeWidth={2.5} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-3 rounded-none bg-white text-slate-400 hover:bg-brand-navy hover:text-white border border-slate-200 transition-all active:scale-95"
                      title="Edit Profile"
                    >
                      <Edit3 size={18} strokeWidth={2.5} />
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
          className="py-32 flex flex-col items-center text-center px-6 rounded-none bg-slate-50 border-2 border-dashed border-slate-200"
        >
          <div className="w-20 h-20 rounded-none bg-white flex items-center justify-center text-slate-200 shadow-none mb-6 border border-slate-100">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2 uppercase">No personnel matching search</h3>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-sm">No records found matching current query parameters.</p>
          <button 
            onClick={() => { setSearch(''); setRoleFilter('all'); }}
            className="mt-8 text-brand-navy font-extrabold text-[10px] uppercase tracking-[0.2em] hover:underline"
          >
             Reset Filters
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

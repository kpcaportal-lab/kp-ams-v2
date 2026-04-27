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
    admin: { color: 'var(--brand-gold)', bg: 'rgba(30, 58, 95, 0.05)', border: 'rgba(30, 58, 95, 0.1)', icon: Key },
    partner: { color: 'var(--brand-navy)', bg: 'rgba(212, 165, 116, 0.1)', border: 'rgba(212, 165, 116, 0.2)', icon: Shield },
    director: { color: 'var(--brand-navy)', bg: 'rgba(212, 165, 116, 0.05)', border: 'rgba(212, 165, 116, 0.1)', icon: Briefcase },
    manager: { color: '#1e3a5f', bg: 'rgba(30, 58, 95, 0.03)', border: 'rgba(30, 58, 95, 0.08)', icon: CheckCircle },
    assistant_manager: { color: '#1e3a5f', bg: 'rgba(30, 58, 95, 0.03)', border: 'rgba(30, 58, 95, 0.08)', icon: CheckCircle },
    sr_executive: { color: '#475569', bg: 'rgba(71, 85, 105, 0.03)', border: 'rgba(71, 85, 105, 0.08)', icon: User },
    executive: { color: '#475569', bg: 'rgba(71, 85, 105, 0.03)', border: 'rgba(71, 85, 105, 0.08)', icon: User },
    analyst: { color: '#475569', bg: 'rgba(71, 85, 105, 0.03)', border: 'rgba(71, 85, 105, 0.08)', icon: Activity },
    staff: { color: '#64748b', bg: 'rgba(100, 116, 139, 0.03)', border: 'rgba(100, 116, 139, 0.08)', icon: User }
  };

  const roleStyles: Record<UserRole, string> = {
    admin: 'bg-brand-navy text-brand-gold border-brand-navy/20',
    partner: 'bg-brand-gold/10 text-brand-navy border-brand-gold/20',
    director: 'bg-brand-gold/5 text-brand-navy border-brand-gold/10',
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
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm font-accent">
            Team <span className="text-brand-gold">& Access</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Coordinate your firm&apos;s human capital and permissions</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-navy text-white text-sm font-black shadow-[0_10px_20px_rgba(30,58,95,0.15)] hover:shadow-[0_15px_30px_rgba(30,58,95,0.25)] transition-all border border-slate-800 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} className="text-brand-gold" />
            Add New Member
          </button>
        )}
      </div>

      {/* Stats Landing Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 px-4 sm:px-0">
        {[
          { label: 'Total Members', val: stats.total, icon: Users, color: 'text-brand-navy', bg: 'bg-brand-navy/5' },
          { label: 'Active Now', val: stats.active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Administrators', val: stats.admins, icon: Shield, color: 'text-brand-gold', bg: 'bg-brand-gold/5' },
          { label: 'Partners/Directors', val: stats.partners, icon: Briefcase, color: 'text-brand-navy', bg: 'bg-brand-navy/5' },
          { label: 'Staff & Ops', val: stats.staff, icon: CheckCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((s, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={s.label}
            className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-[0_15px_30px_rgba(15,23,42,0.05)] transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-lg group-hover:scale-110 transition-transform", s.bg, s.color)}>
                <s.icon size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{s.val}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 px-4 sm:px-0">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or designation..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold/30 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3.5 text-sm font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-gold/5 focus:border-brand-gold/30 transition-all outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">All Roles</option>
              {Object.keys(roleConfig).map(r => (
                <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchUsers}
            className="px-4 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-navy hover:bg-slate-50 transition-all shadow-sm active:scale-95"
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="group relative bg-white rounded-[2rem] border border-slate-200/60 p-7 hover:border-brand-gold/30 hover:shadow-[0_20px_50px_rgba(30,58,95,0.08)] transition-all duration-300"
              >
                {/* Status indicator absolute */}
                <div className={cn(
                  "absolute top-6 right-6 w-3 h-3 rounded-full ring-4 ring-white shadow-sm",
                  user.is_active ? "bg-emerald-500" : "bg-slate-300"
                )} />

                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-brand-navy text-brand-gold flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-105 transition-transform duration-500">
                      {(user.full_name || 'U').charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight font-accent group-hover:text-brand-navy transition-colors">
                      {user.full_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <Mail size={12} strokeWidth={3} className="text-brand-gold" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-4 py-1.5 rounded-lg bg-brand-navy/5 text-brand-navy text-[10px] font-black uppercase tracking-[0.15em] border border-brand-navy/10 flex items-center gap-2">
                      <config.icon size={12} strokeWidth={3} className="text-brand-gold" />
                      {user.role.replace('_', ' ')}
                    </div>
                    {!user.is_active && (
                      <div className="px-4 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest">
                        Deactivated
                      </div>
                    )}
                  </div>

                  {user.reports_to_name && (
                    <div className="flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100/60 group-hover:bg-brand-navy/[0.02] transition-colors">
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-brand-gold shadow-sm">
                        <ArrowUpRight size={14} strokeWidth={3} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reports To</span>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight truncate">{user.reports_to_name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">
                    Member Since<br />
                    <span className="text-brand-navy text-xs font-black tracking-normal">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                        className="p-2.5 rounded-xl bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 shadow-sm transition-all hover:-translate-y-1 active:scale-95"
                        title="Impersonate User"
                      >
                        <User size={18} strokeWidth={2.5} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-2.5 rounded-xl bg-white text-slate-400 hover:bg-brand-navy hover:text-white border border-slate-200 shadow-sm transition-all hover:-translate-y-1 active:scale-95"
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

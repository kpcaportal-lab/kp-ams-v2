'use client';

import { useEffect, useState } from 'react';
import {
  UserPlus, Search, Shield, Mail, MoreVertical,
  UserCircle, BadgeCheck, Plus
} from 'lucide-react';
import api from '@/lib/api';
import type { User, UserRole } from '@/types';
import toast from 'react-hot-toast';
import AddUserModal from '@/components/modals/AddUserModal';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

export default function UsersPage() {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const filtered = profiles.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleStyles: Record<UserRole, string> = {
    admin: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    partner: 'bg-blue-50 text-blue-700 border-blue-200',
    director: 'bg-amber-50 text-amber-700 border-amber-200',
    manager: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    staff: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage team members and their roles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Plus size={18} />
          Add User
        </button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email address..."
          className="input pl-10 w-full md:w-96"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((user, i) => (
          <motion.div
            key={user.id}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="card p-6 flex flex-col group hover:border-blue-300 transition-colors bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl ring-4 ring-blue-50/50">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className={`badge ${roleStyles[user.role]}`}>
                {user.role}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {user.full_name}
                </h3>
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase font-semibold tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                {user.role} Access
              </div>
              <button className="p-2 -mr-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-300">
          <UserCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-900 font-medium text-lg">No users found</h3>
          <p className="text-slate-500 text-sm mt-1">Adjust your search parameters.</p>
        </div>
      )}

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}

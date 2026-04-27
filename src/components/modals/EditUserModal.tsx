'use client';

import React, { useState, useEffect } from 'react';
import { X, UserCheck, Save, Shield, User as UserIcon, Users } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import type { User, UserRole } from '@/types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'partner', label: 'Partner', description: 'Full access to client and user management' },
  { value: 'director', label: 'Director', description: 'Can review and approve proposals' },
  { value: 'manager', label: 'Manager', description: 'Can manage assignments and billing' },
  { value: 'assistant_manager', label: 'Asst. Manager', description: 'Assists with operational management' },
  { value: 'sr_executive', label: 'Sr. Executive', description: 'Senior level operations and reporting' },
  { value: 'executive', label: 'Executive', description: 'General operations and execution' },
  { value: 'staff', label: 'Staff', description: 'Standard platform access' },
  { value: 'analyst', label: 'Analyst', description: 'Data analysis and research' },
  { value: 'admin', label: 'Administrator', description: 'System-wide configuration and security' },
];

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    role: 'staff' as UserRole,
    reports_to: '',
    is_active: true
  });
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

  const fetchSupervisors = React.useCallback(async () => {
    try {
      const res = await api.get('/api/users');
      // Filter for users who can be supervisors
      const potentialSupervisors = res.data.filter((u: User) =>
        (u.role === 'partner' || u.role === 'director' || u.role === 'manager') && u.id !== user?.id
      );
      setSupervisors(potentialSupervisors);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        full_name: user.full_name,
        display_name: user.display_name || '',
        role: user.role,
        reports_to: user.reports_to || '',
        is_active: user.is_active !== false
      });
      fetchSupervisors();
    }
  }, [isOpen, user, fetchSupervisors]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      toast.error('Full Name is required');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/api/users/${user.id}`, {
        ...formData,
        display_name: formData.display_name.trim() || formData.full_name.trim(),
        reports_to: formData.reports_to || null
      });
      toast.success('User updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error 
        : 'Failed to update user';
      toast.error(errorMessage || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-[var(--brand-navy)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--brand-gold)]/20 flex items-center justify-center border border-[var(--brand-gold)]/30">
              <UserCheck className="w-5 h-5 text-[var(--brand-gold)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-gold)] tracking-tight font-accent">Edit User</h2>
              <p className="text-xs text-[var(--brand-gold)]/60 mt-0.5 font-medium">Update account and permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 text-[var(--brand-gold)]/60 hover:text-[var(--brand-gold)] transition-all border border-transparent hover:border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[85vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-[var(--brand-gold)]" />
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] transition-all placeholder:text-slate-300 shadow-sm"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-[var(--brand-gold)]" />
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] transition-all placeholder:text-slate-300 shadow-sm"
                placeholder="John D."
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Users className="w-3 h-3 text-[var(--brand-gold)]" />
              Reporting To (Supervisor)
            </label>
            <select
              className={`w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--brand-gold)]/10 focus:border-[var(--brand-gold)] transition-all cursor-pointer appearance-none shadow-sm ${!isAdmin ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
              value={formData.reports_to}
              onChange={(e) => setFormData({ ...formData, reports_to: e.target.value })}
              disabled={!isAdmin}
            >
              <option value="">No Supervisor (Direct Admin)</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Shield className="w-3 h-3 text-[var(--brand-gold)]" />
              Security Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                    formData.role === role.value
                      ? 'bg-[var(--brand-navy)] border-[var(--brand-navy)] shadow-lg shadow-blue-900/20'
                      : 'bg-white border-slate-200 hover:border-[var(--brand-gold)]/30 hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-[13px] font-bold relative z-10 ${
                    formData.role === role.value ? 'text-[var(--brand-gold)]' : 'text-slate-900 group-hover:text-[var(--brand-navy)]'
                  }`}>
                    {role.label}
                  </span>
                  <span className={`text-[11px] relative z-10 mt-1 line-clamp-1 leading-tight ${
                    formData.role === role.value ? 'text-white/60' : 'text-slate-500'
                  }`}>
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="is_active"
                className="w-5 h-5 text-[var(--brand-navy)] border-slate-300 rounded-lg focus:ring-[var(--brand-gold)] transition-all cursor-pointer"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </div>
            <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
              Account is active and can login
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-[var(--brand-navy)] text-[var(--brand-gold)] text-sm font-bold shadow-[0_8px_20px_rgba(30,58,95,0.25)] hover:shadow-[0_12px_28px_rgba(30,58,95,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[var(--brand-gold)]/30 border-t-[var(--brand-gold)] rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

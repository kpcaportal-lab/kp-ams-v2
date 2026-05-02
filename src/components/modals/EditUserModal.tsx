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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 shadow-none rounded-none">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-brand-navy">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-none">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Modify Personnel Profile</h2>
              <p className="text-[11px] !text-slate-200 font-bold uppercase tracking-widest">System Access Authority</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[85vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold !text-slate-500 uppercase tracking-widest mt-1">Full Legal Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none rounded-none transition-all placeholder:text-slate-300"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Display Designation</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 bg-white text-sm font-semibold focus:border-brand-navy outline-none rounded-none transition-all placeholder:text-slate-300"
                placeholder="John D."
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Direct Reporting Supervisor</label>
            <select
              className={`w-full px-4 py-3 border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none rounded-none transition-all cursor-pointer appearance-none ${!isAdmin ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
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
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Institutional Privilege Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`flex flex-col items-start p-4 border transition-all text-left rounded-none ${
                    formData.role === role.value
                      ? 'bg-brand-navy border-brand-navy text-white'
                      : 'bg-white border-slate-200 hover:border-brand-navy/30 hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <span className="text-[13px] font-extrabold tracking-tight">{role.label}</span>
                  <span className={`text-[10px] mt-1 line-clamp-1 leading-tight ${
                    formData.role === role.value ? 'text-white/60' : 'text-slate-500'
                  }`}>
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-none">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 text-brand-navy border-slate-300 focus:ring-0 rounded-none cursor-pointer"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-[10px] font-extrabold text-brand-navy uppercase tracking-widest cursor-pointer select-none">
              Account Status: ACTIVE & OPERATIONAL
            </label>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-slate-200 text-xs font-extrabold text-slate-500 hover:bg-slate-50 transition-all rounded-none uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-brand-navy text-white text-xs font-extrabold transition-all border-b-2 border-brand-red flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed rounded-none uppercase tracking-widest hover:bg-slate-800"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Execute Record Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

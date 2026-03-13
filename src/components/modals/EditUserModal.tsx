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
  { value: 'manager', label: 'Manager', description: 'Can manage assignments and billing' },
  { value: 'director', label: 'Director', description: 'Can review and approve proposals' },
  { value: 'partner', label: 'Partner', description: 'Full access to client and user management' },
  { value: 'admin', label: 'Administrator', description: 'System-wide configuration and security' },
];

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    role: 'manager' as UserRole,
    reports_to: '',
    is_active: true
  });
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';

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
  }, [isOpen, user]);

  const fetchSupervisors = async () => {
    try {
      const res = await api.get('/api/users');
      // Filter for users who can be supervisors (Partners and Directors)
      // Also prevent self-reporting
      const potentialSupervisors = res.data.filter((u: User) =>
        (u.role === 'partner' || u.role === 'director') && u.id !== user?.id
      );
      setSupervisors(potentialSupervisors);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    }
  };

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
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <UserIcon className="w-3 h-3" />
                Full Name *
              </label>
              <input
                type="text"
                required
                className="input text-sm"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <UserIcon className="w-3 h-3" />
                Display Name
              </label>
              <input
                type="text"
                className="input text-sm"
                placeholder="John D."
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <Users className="w-3 h-3" />
              Reporting To (Supervisor)
            </label>
            <select
              className={`input text-sm h-[42px] ${!isAdmin ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
              value={formData.reports_to}
              onChange={(e) => setFormData({ ...formData, reports_to: e.target.value })}
              disabled={!isAdmin}
            >
              <option value="">No Supervisor (Direct Admin)</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <Shield className="w-3 h-3" />
              Security Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
                    formData.role === role.value
                      ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-sm font-semibold ${
                    formData.role === role.value ? 'text-indigo-700' : 'text-slate-900'
                  }`}>
                    {role.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="is_active"
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              Account is active and can login
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 justify-center h-11"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn bg-indigo-600 hover:bg-indigo-700 text-white flex-1 justify-center h-11"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

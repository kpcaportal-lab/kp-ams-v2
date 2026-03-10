'use client';

import React, { useState } from 'react';
import { X, UserPlus, Save, Shield, Mail, Key, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { UserRole } from '@/types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'manager', label: 'Manager', description: 'Can manage assignments and billing' },
  { value: 'director', label: 'Director', description: 'Can review and approve proposals' },
  { value: 'partner', label: 'Partner', description: 'Full access to client and user management' },
  { value: 'admin', label: 'Administrator', description: 'System-wide configuration and security' },
];

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    display_name: '',
    role: 'manager' as UserRole,
    password: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.full_name.trim()) {
      toast.error('Email and Full Name are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/users', {
        ...formData,
        display_name: formData.display_name.trim() || formData.full_name.trim(),
        password: formData.password || 'KpAms@2025'
      });
      toast.success('User invited successfully');
      onSuccess();
      onClose();
      setFormData({
        email: '',
        full_name: '',
        display_name: '',
        role: 'manager',
        password: ''
      });
    } catch (err: any) {
      console.error('Error adding user:', err);
      toast.error(err.response?.data?.error || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Invite New User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <UserIcon className="w-3 h-3" />
                Full Name *
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <Mail className="w-3 h-3" />
                Email Address *
              </label>
              <input
                type="email"
                required
                className="input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <UserIcon className="w-3 h-3" />
                Display Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="John D."
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <Key className="w-3 h-3" />
                Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="KpAms@2025 (Default)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
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
                      ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-sm font-semibold ${
                    formData.role === role.value ? 'text-blue-700' : 'text-slate-900'
                  }`}>
                    {role.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

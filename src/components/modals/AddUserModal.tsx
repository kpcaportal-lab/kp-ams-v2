import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Shield, Mail, Key, User as UserIcon, Users } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { User, UserRole } from '@/types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    display_name: '',
    role: 'staff' as UserRole,
    password: '',
    reports_to: ''
  });
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSupervisors = React.useCallback(async () => {
    try {
      const res = await api.get('/api/users');
      // Filter for users who can be supervisors (Partners and Directors)
      const potentialSupervisors = res.data.filter((u: User) =>
        u.role === 'partner' || u.role === 'director' || u.role === 'manager'
      );
      setSupervisors(potentialSupervisors);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSupervisors();
    }
  }, [isOpen, fetchSupervisors]);

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
        password: formData.password || 'KpAms@2025',
        reports_to: formData.reports_to || null
      });
      toast.success('User invited successfully');
      onSuccess();
      onClose();
      setFormData({
        email: '',
        full_name: '',
        display_name: '',
        role: 'staff',
        password: '',
        reports_to: ''
      });
    } catch (err) {
      console.error('Error adding user:', err);
      const errorMessage = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to invite user';
      toast.error(errorMessage || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--glass-navy-light)] backdrop-blur-[var(--glass-blur)]">
      <div className="bg-white border border-[var(--brand-navy)] rounded-none w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 shadow-none">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-brand-navy relative overflow-hidden">
          {/* Subtle Decorative Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-16 -translate-y-16" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-none bg-white/10 flex items-center justify-center border border-white/20">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold !text-white tracking-tight uppercase">Invite Team Member</h2>
              <p className="text-[10px] !text-slate-200 font-extrabold uppercase tracking-[0.2em]">K&P Workforce Access Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none hover:bg-white/10 text-white/60 hover:text-white transition-all relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[85vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Full Legal Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300 uppercase"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Display Designation</label>
              <input
                type="text"
                className="w-full px-4 py-3.5 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300 uppercase"
                placeholder="John D."
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Secure Extension Pin</label>
              <input
                type="password"
                className="w-full px-4 py-3.5 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all placeholder:text-slate-300"
                placeholder="KpAms@2025 (Default)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Supervisor Designation</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3.5 rounded-none border border-slate-200 bg-white text-sm font-extrabold focus:border-brand-navy outline-none transition-all cursor-pointer appearance-none uppercase"
                value={formData.reports_to}
                onChange={(e) => setFormData({ ...formData, reports_to: e.target.value })}
              >
                <option value="">Direct Institutional Report</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} — {s.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Users size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Security Privilege Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`flex flex-col items-start p-4 rounded-none border transition-all text-left group ${formData.role === role.value
                      ? 'bg-brand-navy border-brand-navy text-white'
                      : 'bg-white border-slate-200 hover:border-brand-navy/30 hover:bg-slate-50 text-slate-900'
                    }`}
                >
                  <span className="text-[11px] font-extrabold tracking-tight uppercase">{role.label}</span>
                  <span className={`text-[9px] mt-1 line-clamp-1 leading-tight font-extrabold uppercase tracking-wider ${formData.role === role.value ? 'text-white/50' : 'text-slate-400'
                    }`}>
                    {role.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-none border border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 rounded-none bg-brand-navy text-white text-[10px] font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-all border-b-2 border-brand-red flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-none animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Execute Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

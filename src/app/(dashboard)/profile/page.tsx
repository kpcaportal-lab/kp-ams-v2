'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Mail, 
    Phone, 
    Shield, 
    UserCircle, 
    LogOut, 
    Edit2, 
    Save, 
    X, 
    ExternalLink,
    CheckCircle,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
    const { user, fetchUser, logout } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [workFileUrl, setWorkFileUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || '');
            setPhoneNumber(user.phone_number || '');
            setWorkFileUrl(user.work_file_url || '');
        }
    }, [user]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/api/profile', {
                display_name: displayName,
                phone_number: phoneNumber,
                work_file_url: workFileUrl,
            });
            await fetchUser();
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            logout();
            window.location.href = '/login';
        }
    };

    if (!user) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2rem] bg-[var(--brand-navy)] px-8 py-10 md:px-12 md:py-14 text-white shadow-2xl shadow-brand-navy/20"
            >
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[var(--brand-gold)]/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-[var(--brand-gold)] flex items-center justify-center text-[var(--brand-navy)] text-3xl font-black shadow-2xl shadow-brand-gold/20">
                            {user.full_name?.charAt(0)}
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/20 text-[var(--brand-gold)] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                                <Sparkles size={14} /> Account Settings
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-accent">{user.full_name}</h1>
                            <p className="text-white/60 text-sm font-medium mt-1">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-bold transition-all"
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-sm font-bold transition-all"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 font-accent">
                            <UserCircle size={20} className="text-[var(--brand-navy)]" /> Overview
                        </h3>
                    </div>
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-[1.5rem] bg-[var(--brand-navy)] flex items-center justify-center text-[var(--brand-gold)] text-3xl font-black shadow-xl shadow-brand-navy/10">
                                {user.full_name?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-[3px] border-white rounded-full" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-1">{user.full_name}</h2>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-navy)]/5 text-[var(--brand-navy)] text-[10px] font-black uppercase tracking-[0.15em] border border-[var(--brand-navy)]/10 mb-6">
                            <Shield size={10} /> {user.role}
                        </span>

                        <div className="w-full space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Mail size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</div>
                                    <div className="text-sm font-bold text-slate-700 truncate">{user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Phone size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</div>
                                    <div className="text-sm font-bold text-slate-700">{user.phone_number || '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                    <Shield size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</div>
                                    <div className="text-sm font-bold text-slate-700 capitalize">{user.role.replace('_', ' ')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Settings Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                >
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 font-accent">
                            <User size={20} className="text-[var(--brand-navy)]" /> Personal Information
                        </h3>
                        {isEditing && (
                            <span className="text-[10px] font-black text-[var(--brand-gold)] uppercase tracking-[0.2em] bg-[var(--brand-gold)]/10 px-3 py-1 rounded-full border border-[var(--brand-gold)]/20">Editing</span>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex-1 p-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Full Name (read-only) */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 text-sm font-bold text-slate-500 cursor-not-allowed"
                                            value={user.full_name} 
                                            disabled 
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 px-1">
                                        <Shield size={10} /> Managed by administration
                                    </p>
                                </div>

                                {/* Email (read-only) */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 text-sm font-bold text-slate-500 cursor-not-allowed"
                                            value={user.email} 
                                            disabled 
                                        />
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                                    <input 
                                        type="text" 
                                        className={cn(
                                            "w-full px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all outline-none",
                                            isEditing 
                                                ? "border-[var(--brand-gold)] bg-white ring-4 ring-[var(--brand-gold)]/10 text-slate-900 focus:border-[var(--brand-gold)]" 
                                                : "border-slate-200 bg-slate-50/50 text-slate-700"
                                        )}
                                        placeholder="How others see you"
                                        value={isEditing ? displayName : (user.display_name || user.full_name)} 
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className={cn(
                                                "w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-bold transition-all outline-none",
                                                isEditing 
                                                    ? "border-[var(--brand-gold)] bg-white ring-4 ring-[var(--brand-gold)]/10 text-slate-900 focus:border-[var(--brand-gold)]" 
                                                    : "border-slate-200 bg-slate-50/50 text-slate-700"
                                            )}
                                            placeholder="Enter phone number"
                                            value={isEditing ? phoneNumber : (user.phone_number || '')} 
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Work File URL */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Portal Verification URL (Work File)</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="url" 
                                        className={cn(
                                            "w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm font-bold transition-all outline-none",
                                            isEditing 
                                                ? "border-[var(--brand-gold)] bg-white ring-4 ring-[var(--brand-gold)]/10 text-slate-900 focus:border-[var(--brand-gold)]" 
                                                : "border-slate-200 bg-slate-50/50 text-slate-700"
                                        )}
                                        placeholder="https://link-to-your-work-file.com"
                                        value={isEditing ? workFileUrl : (user.work_file_url || '')} 
                                        onChange={(e) => setWorkFileUrl(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium italic px-1">
                                    Optional: Link to your CV, certifications, or professional portfolio.
                                </p>
                            </div>

                            {/* Work File Link Display */}
                            {!isEditing && user.work_file_url && (
                                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-[var(--brand-navy)]/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[var(--brand-navy)] shadow-sm group-hover:scale-110 transition-transform">
                                            <ExternalLink size={22} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Portal Verification URL</p>
                                            <p className="text-xs text-slate-400 font-medium">Access your external verification files</p>
                                        </div>
                                    </div>
                                    <a 
                                        href={user.work_file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/5 hover:border-[var(--brand-navy)]/20 transition-all"
                                    >
                                        Open Portal
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <AnimatePresence>
                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-3 justify-end mt-8 pt-6 border-t border-slate-100"
                                >
                                    <button 
                                        type="button" 
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setDisplayName(user.display_name || '');
                                            setPhoneNumber(user.phone_number || '');
                                            setWorkFileUrl(user.work_file_url || '');
                                        }}
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--brand-navy)] text-[var(--brand-gold)] text-sm font-bold shadow-xl shadow-brand-navy/10 hover:shadow-brand-navy/20 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--brand-gold)] border-t-transparent" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        Save Changes
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

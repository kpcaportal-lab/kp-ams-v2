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
                <div className="absolute inset-0 border-4 border-slate-200 rounded-none" />
                <div className="absolute inset-0 border-4 border-[var(--brand-navy)] rounded-none border-t-transparent animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-none bg-[var(--brand-navy)] px-8 py-10 md:px-12 md:py-14 text-white shadow-none border-b-4 border-brand-red"
            >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-none bg-white text-[var(--brand-navy)] flex items-center justify-center text-4xl font-extrabold border-2 border-white shadow-none">
                            {user?.full_name?.charAt(0)}
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/10 border border-white/20 text-white text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2">
                                <Sparkles size={14} className="text-brand-red" /> Institutional Account Profile
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase !text-white">{user?.full_name}</h1>
                            <p className="text-white/60 text-[10px] font-extrabold uppercase mt-1 tracking-widest">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing && (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-6 py-4 rounded-none bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-extrabold transition-all active:scale-95 uppercase tracking-widest"
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-4 rounded-none bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold transition-all active:scale-95 uppercase tracking-widest"
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
                    className="bg-white rounded-none border border-slate-200 shadow-none overflow-hidden"
                >
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-[10px] font-extrabold text-slate-900 tracking-widest flex items-center gap-2 uppercase">
                            <UserCircle size={18} className="text-[var(--brand-navy)]" /> Profile Overview
                        </h3>
                    </div>
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-none bg-[var(--brand-navy)] flex items-center justify-center text-white text-3xl font-extrabold shadow-none border-4 border-brand-navy">
                                {user?.full_name?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 border-[3px] border-white rounded-none" />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-1 uppercase tracking-tight">{user?.full_name}</h2>
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-brand-navy text-white text-[10px] font-extrabold uppercase tracking-[0.2em] border border-brand-navy mb-8">
                            <Shield size={10} /> {user?.role?.replace('_', ' ')}
                        </span>

                        <div className="w-full space-y-4 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-none bg-slate-50 flex items-center justify-center text-brand-navy border border-slate-200">
                                    <Mail size={16} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Authorized Email</div>
                                    <div className="text-sm font-extrabold text-slate-800 truncate">{user?.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-none bg-slate-50 flex items-center justify-center text-brand-navy border border-slate-200">
                                    <Phone size={16} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Contact Extension</div>
                                    <div className="text-sm font-extrabold text-slate-800">{user?.phone_number || '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-none bg-slate-50 flex items-center justify-center text-brand-navy border border-slate-200">
                                    <Shield size={16} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Privilege Designation</div>
                                    <div className="text-sm font-extrabold text-slate-800 uppercase">{user?.role?.replace('_', ' ')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Settings Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-white rounded-none border border-slate-200 shadow-none overflow-hidden flex flex-col"
                >
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="text-[10px] font-extrabold text-slate-900 tracking-widest flex items-center gap-2 uppercase">
                            <User size={18} className="text-[var(--brand-navy)]" /> Identity Management
                        </h3>
                        {isEditing && (
                            <span className="text-[9px] font-extrabold text-white uppercase tracking-[0.2em] bg-brand-navy px-3 py-1 rounded-none border border-brand-navy">Authorized Modification Mode</span>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex-1 p-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Full Name (read-only) */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Full Legal Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-11 pr-4 py-4 rounded-none border border-slate-200 bg-slate-50 text-sm font-extrabold text-slate-400 cursor-not-allowed uppercase"
                                            value={user?.full_name || ''} 
                                            disabled 
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-extrabold flex items-center gap-1 px-1 uppercase tracking-widest mt-1">
                                        <Shield size={10} /> Verified Record: Managed by Administration
                                    </p>
                                </div>

                                {/* Email (read-only) */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Authorized Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-11 pr-4 py-4 rounded-none border border-slate-200 bg-slate-50 text-sm font-extrabold text-slate-400 cursor-not-allowed"
                                            value={user?.email || ''} 
                                            disabled 
                                        />
                                    </div>
                                </div>

                                {/* Display Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Display Designation</label>
                                    <input 
                                        type="text" 
                                        className={cn(
                                            "w-full px-4 py-4 rounded-none border text-sm font-extrabold transition-all outline-none uppercase",
                                            isEditing 
                                                ? "border-brand-navy bg-white text-slate-900 focus:border-brand-navy" 
                                                : "border-slate-200 bg-slate-50 text-slate-600"
                                        )}
                                        placeholder="Enter display name"
                                        value={isEditing ? displayName : (user?.display_name || user?.full_name || '')} 
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Contact Extension</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            className={cn(
                                                "w-full pl-11 pr-4 py-4 rounded-none border text-sm font-extrabold transition-all outline-none",
                                                isEditing 
                                                    ? "border-brand-navy bg-white text-slate-900 focus:border-brand-navy" 
                                                    : "border-slate-200 bg-slate-50 text-slate-600"
                                            )}
                                            placeholder="Enter phone number"
                                            value={isEditing ? phoneNumber : (user?.phone_number || '')} 
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Work File URL */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">Credential Verification URL (External)</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="url" 
                                        className={cn(
                                            "w-full pl-11 pr-4 py-4 rounded-none border text-sm font-extrabold transition-all outline-none",
                                            isEditing 
                                                ? "border-brand-navy bg-white text-slate-900 focus:border-brand-navy" 
                                                : "border-slate-200 bg-slate-50 text-slate-600"
                                        )}
                                        placeholder="https://link-to-your-work-file.com"
                                        value={isEditing ? workFileUrl : (user?.work_file_url || '')} 
                                        onChange={(e) => setWorkFileUrl(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                                    Authorized external link to CV, certifications, or professional portfolio.
                                </p>
                            </div>

                            {/* Work File Link Display */}
                            {!isEditing && user?.work_file_url && (
                                <div className="p-6 rounded-none bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-brand-navy/30 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-none bg-white border border-slate-200 flex items-center justify-center text-brand-navy shadow-none transition-transform group-hover:scale-105">
                                            <ExternalLink size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest">Verification Link</p>
                                            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Secure external document portal</p>
                                        </div>
                                    </div>
                                    <a 
                                        href={user?.work_file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 rounded-none bg-white border border-slate-200 text-[10px] font-extrabold text-brand-navy hover:bg-brand-navy hover:text-white transition-all uppercase tracking-widest"
                                    >
                                        Access Record
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
                                    className="flex items-center gap-3 justify-end mt-10 pt-8 border-t border-slate-100"
                                >
                                    <button 
                                        type="button" 
                                        className="flex items-center gap-2 px-8 py-4 rounded-none border border-slate-200 text-[10px] font-extrabold text-slate-500 hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setDisplayName(user?.display_name || '');
                                            setPhoneNumber(user?.phone_number || '');
                                            setWorkFileUrl(user?.work_file_url || '');
                                        }}
                                    >
                                        <X size={16} /> Discard Changes
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex items-center gap-2 px-8 py-4 rounded-none bg-brand-navy text-white text-[10px] font-extrabold transition-all border-b-2 border-brand-red active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-none" />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        Commit Record Update
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

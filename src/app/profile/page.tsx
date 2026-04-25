'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
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
    CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
    const { user, fetchUser, logout } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [workFileUrl, setWorkFileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

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
            await fetchUser(); // Reload user context
            setIsEditing(false);
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 3000);
        } catch (error) {
            console.error('Failed to update profile', error);
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <UserCircle className="text-primary" size={32} />
                        Account Settings
                    </h1>
                    <p className="page-subtitle">Manage your professional profile and contact information</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleLogout}
                        className="btn btn-secondary text-danger border-danger/30 hover:bg-danger/5"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary"
                        >
                            <Edit2 size={18} />
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3 text-success animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} />
                    <span className="font-medium text-sm">Profile updated successfully!</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1">
                    <div className="card p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 relative">
                            <span className="text-3xl font-bold">
                                {user.full_name?.charAt(0)}
                            </span>
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-success border-2 border-white rounded-full"></div>
                        </div>
                        <h2 className="text-xl font-bold text-primary mb-1">{user.full_name}</h2>
                        <div className="badge badge-indigo mb-4 uppercase tracking-wider text-[10px]">
                            {user.role}
                        </div>
                        <div className="w-full pt-4 border-t border-border flex flex-col gap-3 text-left">
                            <div className="flex items-center gap-3 text-secondary">
                                <Mail size={16} className="text-muted" />
                                <span className="text-sm truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-secondary">
                                <Shield size={16} className="text-muted" />
                                <span className="text-sm capitalize">{user.role.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Settings Card */}
                <div className="lg:col-span-2">
                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <User size={20} className="text-primary" />
                                Personal Information
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="label">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input 
                                            type="text" 
                                            className="input pl-10 bg-muted/50 cursor-not-allowed" 
                                            value={user.full_name} 
                                            disabled 
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted flex items-center gap-1 mt-1">
                                        <Shield size={10} />
                                        Managed by administration
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="label">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input 
                                            type="text" 
                                            className="input pl-10 bg-muted/50 cursor-not-allowed" 
                                            value={user.email} 
                                            disabled 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="label">Display Name</label>
                                    <input 
                                        type="text" 
                                        className={`input ${isEditing ? 'border-primary' : ''}`}
                                        placeholder="How others see you"
                                        value={isEditing ? displayName : (user.display_name || user.full_name)} 
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="label">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input 
                                            type="text" 
                                            className={`input pl-10 ${isEditing ? 'border-primary' : ''}`}
                                            placeholder="Enter phone number"
                                            value={isEditing ? phoneNumber : (user.phone_number || '')} 
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-full space-y-1.5 pt-2">
                                    <label className="label">Portal Verification URL (Work File)</label>
                                    <div className="relative">
                                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input 
                                            type="url" 
                                            className={`input pl-10 ${isEditing ? 'border-primary' : ''}`}
                                            placeholder="https://link-to-your-work-file.com"
                                            value={isEditing ? workFileUrl : (user.work_file_url || '')} 
                                            onChange={(e) => setWorkFileUrl(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted mt-1 italic">
                                        Optional: Link to your CV, certifications, or professional portfolio.
                                    </p>
                                </div>

                                {!isEditing && user.work_file_url && (
                                    <div className="col-span-full pt-4">
                                        <label className="label">Verification & Work Files</label>
                                        <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-between group hover:border-primary/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <ExternalLink size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-primary">Portal Verification URL</p>
                                                    <p className="text-xs text-muted">Access your external verification files</p>
                                                </div>
                                            </div>
                                            <a 
                                                href={user.work_file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                            >
                                                Open Portal
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex items-center gap-3 justify-end mt-8 pt-6 border-t border-border">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setDisplayName(user.display_name || '');
                                            setPhoneNumber(user.phone_number || '');
                                            setWorkFileUrl(user.work_file_url || '');
                                        }}
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

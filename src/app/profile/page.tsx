'use client';

import { useState, FormEvent } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ProfilePage() {
    const { user, fetchUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [displayName, setDisplayName] = useState(user?.display_name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/profile', {
                display_name: displayName,
                phone_number: phoneNumber,
            });
            await fetchUser(); // Reload user context
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ padding: '2rem' }}>Loading user data...</div>;

    return (
        <div style={{ padding: '24px 32px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                        My Profile
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage your account settings and preferences.</p>
                </div>
                {!isEditing && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => {
                                if (confirm('Are you sure you want to log out?')) {
                                    useAuthStore.getState().logout();
                                    window.location.href = '/login';
                                }
                            }}
                            className="btn-secondary"
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                        >
                            Log Out
                        </button>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="btn-primary"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div>
                            <label className="form-label">Full Name</label>
                            <input 
                                type="text" 
                                className="input" 
                                value={user.full_name} 
                                disabled 
                                style={{ background: 'var(--bg-muted)' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Full name is managed by administrators.
                            </p>
                        </div>
                        
                        <div>
                            <label className="form-label">Email</label>
                            <input 
                                type="text" 
                                className="input" 
                                value={user.email} 
                                disabled 
                                style={{ background: 'var(--bg-muted)' }}
                            />
                        </div>

                        <div>
                            <label className="form-label">Role</label>
                            <input 
                                type="text" 
                                className="input" 
                                value={user.role} 
                                disabled 
                                style={{ background: 'var(--bg-muted)', textTransform: 'uppercase' }}
                            />
                        </div>

                        <div>
                            <label className="form-label">Display Name (Optional)</label>
                            <input 
                                type="text" 
                                className="input" 
                                value={isEditing ? displayName : (user.display_name || '-')} 
                                onChange={(e) => setDisplayName(e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="form-label">Phone Number (Optional)</label>
                            <input 
                                type="text" 
                                className="input" 
                                value={isEditing ? phoneNumber : (user.phone_number || '-')} 
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-default)', paddingTop: '24px' }}>
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={() => {
                                    setIsEditing(false);
                                    setDisplayName(user.display_name || '');
                                    setPhoneNumber(user.phone_number || '');
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from '@/hooks/useNavigate';
import { Building2, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
      // Small delay to ensure localStorage is synced before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)', fontFamily: 'var(--font-sans)' }}>
      {/* Left side: Branding / Illustration (Hidden on small screens) */}
      <div className="hidden lg:flex" style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, var(--brand-navy) 0%, var(--navy-900) 100%)',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(212,165,116,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ maxWidth: 480, position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '3.5rem', display: 'inline-block' }}>
            <img src="/images/logo_full.png" alt="Kirtane & Pandit" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-accent)' }}>
            Assignment Management System
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
            Streamlined tracking, efficient professional workflows, and centralized assignment controls for Kirtane &amp; Pandit.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="lg:hidden" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <img src="/images/logo_full.png" alt="Kirtane & Pandit" style={{ height: '90px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-accent)' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Sign in to your K&amp;P portal account</p>
          </div>

          {error && (
            <div style={{ 
              background: 'var(--bg-danger-light)', 
              color: 'var(--color-danger)', 
              padding: '1rem', 
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(220, 38, 38, 0.1)'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </div>
                <input 
                  id="email"
                  type="email" 
                  className="input" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@kpc.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </div>
                <input 
                  id="password"
                  type="password" 
                  className="input" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem', height: '44px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Secure portal for Kirtane &amp; Pandit internal use only.
          </p>
        </div>
      </div>
    </div>
  );
}

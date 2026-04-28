'use client';
// Force HMR to clear cached images and load BrandedLogo


import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from '@/hooks/useNavigate';
import { Building2, Lock, Mail, AlertCircle } from 'lucide-react';
import { BrandedLogo } from '@/components/BrandedLogo';

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
          <div style={{ marginBottom: '3.5rem' }}>
            {/* Using official KPCA logo */}
            <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl inline-block">
               <div className="flex flex-col">
                 <span className="text-2xl font-black tracking-[0.15em] text-white font-accent leading-none">
                   KIRTANE <span className="text-brand-gold">&</span> PANDIT
                 </span>
                 <span className="text-[9px] font-bold text-white/50 tracking-[0.2em] mt-2 uppercase">
                   Pune | Mumbai | Nashik | Bengaluru | Hyderabad | New Delhi | Chennai
                 </span>
               </div>
            </div>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '1.5rem', letterSpacing: '-0.03em', fontFamily: 'var(--font-accent)' }}>
            Assignment Management System
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6, maxWidth: '90%' }}>
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
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="lg:hidden flex justify-center mb-10 w-48 mx-auto">
              {/* Using official KPCA logo */}
              <img src="/KPCA-logo.png" alt="Kirtane & Pandit Logo" className="w-full h-auto object-contain drop-shadow-sm" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-accent)' }}>
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

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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FFFFFF', fontFamily: 'var(--font-primary)' }}>
      {/* Left side: Branding / Illustration (Hidden on small screens) */}
      <div className="hidden lg:flex" style={{
        flex: 1,
        background: 'var(--brand-navy)',
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
            <div className="bg-white px-8 py-6 rounded-none border-l-8 border-brand-red shadow-none inline-block">
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-[0.15em] text-[var(--brand-navy)] leading-none">
                  KIRTANE <span className="text-brand-red">&</span> PANDIT
                </span>
                <span className="text-[9px] font-black text-slate-500 tracking-[0.2em] mt-2 uppercase">
                  Chartered Accountants
                </span>
              </div>
            </div>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#FFFFFF', textTransform: 'uppercase' }}>
            Assignment<br />Management<br />System
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, maxWidth: '90%', fontWeight: 500, letterSpacing: '0.025em' }}>
            Value-driven, technology-enabled professional services that empower clients to achieve sustainable growth and informed decision-making.
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
              <img src="/KPCA-logo.png" alt="Kirtane & Pandit Logo" className="w-full h-auto object-contain" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Access Portal</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(184, 32, 40, 0.05)',
              color: 'var(--brand-red)',
              padding: '1rem',
              borderRadius: '0',
              fontSize: '0.875rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--brand-red)'
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
                  className="input !rounded-none"
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
                <a href="#" style={{ fontSize: '0.75rem', color: 'var(--brand-navy)', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  className="input !rounded-none"
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
              className="btn btn-primary !rounded-none"
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

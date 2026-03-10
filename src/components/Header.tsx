'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Bell, Search, User as UserIcon, Menu } from 'lucide-react';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Simple breadcrumb logic based on pathname
  const generateTitle = () => {
    const path = pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="header" style={{
      height: '72px',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.5rem', marginRight: '-0.5rem' }}
        >
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }} className="hide-on-mobile">
          {generateTitle()}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Global Search - Mock */}
        <div style={{ position: 'relative', display: 'none' }} className="md:block">
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search assignments, clients..." 
            className="input"
            style={{ 
              width: '320px', 
              paddingLeft: '36px', 
              height: '40px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-default)', 
              background: 'var(--bg-muted)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Notifications */}
        <button style={{ 
          position: 'relative', 
          width: 40, height: 40, 
          borderRadius: 8, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-default)',
          cursor: 'pointer',
          color: 'var(--text-secondary)'
        }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-danger)',
            border: '2px solid var(--bg-surface)'
          }} />
        </button>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-default)' }} className="user-profile">
          <div style={{ textAlign: 'right' }} className="hide-on-mobile">
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.full_name || 'Guest User'}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              {user?.role || 'Viewer'}
            </div>
          </div>
          <div style={{ 
            width: 40, height: 40, borderRadius: 8, 
            background: 'var(--color-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1rem'
          }}>
            {user?.full_name ? user.full_name.charAt(0) : <UserIcon size={20} />}
          </div>
        </div>
      </div>
    </header>
  );
}

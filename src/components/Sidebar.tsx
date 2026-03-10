'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'partner', 'director', 'manager'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'partner', 'director', 'manager'] },
  { name: 'Proposals', href: '/proposals', icon: FileText, roles: ['admin', 'partner', 'director', 'manager'] },
  { name: 'Assignments', href: '/assignments', icon: ClipboardList, roles: ['admin', 'partner', 'director', 'manager'] },
  { name: 'Billing', href: '/billing', icon: Receipt, roles: ['admin', 'partner', 'director'] },
  { name: 'Organization', href: '/organization', icon: Settings, roles: ['admin'] },
];

export function Sidebar({ 
  isMobileOpen, 
  setIsMobileOpen 
}: { 
  isMobileOpen?: boolean; 
  setIsMobileOpen?: (val: boolean) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Handle responsive sidebar on mount
  useEffect(() => {
    const checkWidth = () => setIsCollapsed(window.innerWidth < 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const filteredNav = navigation.filter(item => 
    user ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.4)', 
            zIndex: 40
          }}
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}
      <aside
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: isCollapsed && !isMobileOpen ? '80px' : '260px',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          position: 'relative', // Set to fixed in globals.css for mobile
          zIndex: 50,
          background: 'var(--bg-main)',
          borderRight: '1px solid var(--border)'
        }}
      >
      {/* Brand logo */}
      <div style={{ height: '72px', display: 'flex', alignItems: 'center', padding: isCollapsed ? '0 18px' : '0 24px', borderBottom: '1px solid var(--border)', transition: 'padding 0.3s ease' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
        }}>
          <Building2 size={20} color="#fff" />
        </div>
        {(!isCollapsed || isMobileOpen) && (
          <div style={{ marginLeft: 12, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>KP AMS</span>
            <span style={{ display: 'block', fontWeight: 500, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Management</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: isCollapsed ? '12px' : '12px 16px',
                borderRadius: '12px',
                color: isActive ? '#2563EB' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative'
              }}
              title={isCollapsed ? item.name : undefined}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 8, bottom: 8, left: -16, width: 4,
                  background: '#2563EB', borderTopRightRadius: 4, borderBottomRightRadius: 4
                }} />
              )}
              <item.icon size={20} style={{ flexShrink: 0, color: isActive ? '#2563EB' : 'var(--text-muted)' }} />
              {(!isCollapsed || isMobileOpen) && <span style={{ marginLeft: 16 }}>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start',
            width: '100%', padding: '12px', borderRadius: '12px',
            color: 'var(--text-secondary)', background: 'transparent',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 500
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--bg-danger-light)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {(!isCollapsed || isMobileOpen) && <span style={{ marginLeft: 16 }}>Log out</span>}
        </button>
      </div>

      {/* Collapse Toggle - hide on mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hide-on-mobile"
        style={{
          position: 'absolute', top: 24, right: -12, width: 24, height: 24,
          background: '#fff', border: '1px solid var(--border)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-muted)', zIndex: 10,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
    </>
  );
}

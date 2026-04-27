'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  LayoutDashboard,
  BarChart3,
  Users, 
  FileText, 
  ClipboardList, 
  Receipt,
  Shield,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  HardDrive
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Insights', href: '/insights', icon: BarChart3, roles: ['admin', 'partner', 'director'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Proposals', href: '/proposals', icon: FileText, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Assignments', href: '/assignments', icon: ClipboardList, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Vault', href: '/documents', icon: HardDrive, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Billing', href: '/billing', icon: Receipt, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Tickets', href: '/tickets', icon: LifeBuoy, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Users', href: '/users', icon: UserCog, roles: ['admin'] },
  { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin'] },
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredNav = navigation.filter(item => 
    user ? item.roles.includes(user.role) : false
  );

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 lg:static z-50 flex flex-col bg-white border-r border-slate-200/60 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand logo */}
        <div className="h-[72px] flex items-center px-5 border-b border-slate-100/80 overflow-hidden whitespace-nowrap">
          <Link href="/dashboard" className="flex items-center">
            {(!isCollapsed || isMobileOpen) ? (
              <img src="/files/logo-horizontal.svg" alt="Kirtane & Pandit AMS" className="h-10 w-auto" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <img src="/files/logo-icon.svg" alt="KP AMS" className="h-8 w-auto" />
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center group relative h-12 px-4 rounded-2xl transition-all duration-300 ease-in-out",
                  isActive 
                    ? "bg-[var(--brand-navy)]/5 text-[var(--brand-navy)] font-black shadow-sm shadow-brand-navy/5" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-4"
                )}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileOpen?.(false)}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--brand-gold)] rounded-full shadow-[2px_0_12px_rgba(212,175,55,0.6)]" 
                  />
                )}
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 3 : 2.5}
                  className={cn(
                    "shrink-0 transition-all duration-300 group-hover:scale-110",
                    isActive ? "text-[var(--brand-navy)]" : "text-slate-400 group-hover:text-[var(--brand-navy)]"
                  )} 
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="text-sm font-bold tracking-tight uppercase text-[10px] letter-spacing-wide">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout */}
        <div className="p-4 bg-slate-50/30 backdrop-blur-sm border-t border-slate-100 flex flex-col gap-2">
          <Link
            href="/profile"
            className={cn(
              "flex items-center h-12 px-4 rounded-2xl transition-all duration-300",
              pathname === '/profile' 
                ? "bg-white text-[var(--brand-navy)] font-black shadow-md shadow-brand-navy/5" 
                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-md",
              isCollapsed ? "justify-center px-0" : "justify-start gap-4"
            )}
            title={isCollapsed ? "Profile Settings" : undefined}
            onClick={() => setIsMobileOpen?.(false)}
          >
            <UserCog size={20} strokeWidth={2.5} className="shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm font-bold tracking-tight uppercase text-[10px]">Security & Profile</span>}
          </Link>
          
          <button
            onClick={() => {
              if (confirm('Log out from KP AMS?')) {
                logout();
                window.location.href = '/login';
              }
            }}
            className={cn(
              "flex items-center h-12 px-4 rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 group transition-all duration-300",
              isCollapsed ? "justify-center px-0" : "justify-start gap-4"
            )}
            title={isCollapsed ? "Logout Session" : undefined}
          >
            <LogOut size={20} strokeWidth={2.5} className="shrink-0 group-hover:translate-x-1 transition-transform" />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm font-bold tracking-tight uppercase text-[10px]">End Session</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute top-[24px] right-[-14px] w-7 h-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-[var(--brand-navy)] hover:border-[var(--brand-navy)]/20 hover:shadow-lg transition-all z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}

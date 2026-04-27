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
import { motion } from 'framer-motion';
import { BrandedLogo } from './BrandedLogo';

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
          "fixed inset-y-0 left-0 lg:static z-50 flex flex-col bg-brand-navy text-white border-r border-brand-gold/10 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand logo */}
        <div className="h-[88px] flex items-center px-4 border-b border-white/5 bg-white/5 backdrop-blur-sm">
          <Link href="/dashboard" className="flex items-center w-full justify-center">
            {(!isCollapsed || isMobileOpen) ? (
              <div className="flex items-center justify-center w-full bg-white/10 rounded-xl p-2.5 shadow-inner backdrop-blur-md">
                 <img src="/KPCA-logo.png" alt="KPCA" className="h-10 w-auto object-contain brightness-0 invert" />
              </div>
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl p-2 shadow-inner">
                 <img src="/KPCA-logo.png" alt="KPCA" className="w-full h-full object-contain brightness-0 invert scale-125" />
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center group relative h-12 px-4 rounded-2xl transition-all duration-300 ease-in-out",
                  isActive 
                    ? "bg-brand-gold text-brand-navy font-black shadow-lg shadow-brand-gold/20" 
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-4"
                )}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileOpen?.(false)}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute right-2 w-1.5 h-1.5 bg-brand-navy rounded-full" 
                  />
                )}
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 3 : 2.5}
                  className={cn(
                    "shrink-0 transition-all duration-300 group-hover:scale-110",
                    isActive ? "text-brand-navy" : "text-brand-gold/70 group-hover:text-brand-gold"
                  )} 
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="font-black tracking-[0.2em] text-[10px] uppercase">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-sm flex flex-col gap-2">
          <Link
            href="/profile"
            className={cn(
              "flex items-center h-12 px-4 rounded-2xl transition-all duration-300",
              pathname === '/profile' 
                ? "bg-brand-gold text-brand-navy font-black shadow-lg shadow-brand-gold/20" 
                : "text-white/60 hover:bg-white/10 hover:text-white",
              isCollapsed ? "justify-center px-0" : "justify-start gap-4"
            )}
            title={isCollapsed ? "Profile Settings" : undefined}
            onClick={() => setIsMobileOpen?.(false)}
          >
            <UserCog size={20} strokeWidth={2.5} className="shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="font-black tracking-[0.15em] text-[10px] uppercase">Security & Profile</span>}
          </Link>
          
          <button
            onClick={() => {
              if (confirm('Log out from KP AMS?')) {
                logout();
                window.location.href = '/login';
              }
            }}
            className={cn(
              "flex items-center h-12 px-4 rounded-2xl text-white/50 hover:bg-red-500/10 hover:text-red-400 group transition-all duration-300",
              isCollapsed ? "justify-center px-0" : "justify-start gap-4"
            )}
            title={isCollapsed ? "Logout Session" : undefined}
          >
            <LogOut size={20} strokeWidth={2.5} className="shrink-0 group-hover:translate-x-1 transition-transform" />
            {(!isCollapsed || isMobileOpen) && <span className="font-black tracking-[0.15em] text-[10px] uppercase">End Session</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute top-[24px] right-[-14px] w-7 h-7 bg-brand-gold text-brand-navy rounded-full items-center justify-center shadow-lg shadow-brand-gold/30 hover:scale-110 transition-all z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}

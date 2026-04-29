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
  { name: 'Firm Insights', href: '/insights', icon: BarChart3, roles: ['admin', 'partner', 'director'] },
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
          "fixed inset-y-0 left-0 lg:static z-50 flex flex-col bg-brand-navy text-white border-r border-white/10 transition-all duration-300 ease-in-out shadow-none lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand logo */}
        <div className={cn("h-[88px] flex items-center border-b border-white/5 bg-white/5 backdrop-blur-sm", isCollapsed && !isMobileOpen ? "px-0" : "px-4")}>
          <Link href="/dashboard" className="flex items-center w-full justify-center">
            <BrandedLogo
              variant="monogram"
              theme="dark"
              className={cn(
                "transition-all duration-500",
                isCollapsed && !isMobileOpen ? "scale-90" : "scale-110"
              )}
            />

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-white font-black tracking-tight text-xl"></span>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]"></span>
              </motion.div>
            )}

          </Link>
        </div>

        {/* Navigation Links */}
        <nav className={cn("flex-1 py-8 flex flex-col gap-2 overflow-y-auto custom-scrollbar", isCollapsed && !isMobileOpen ? "px-0" : "px-4")}>
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center group relative h-12 px-4 rounded-none transition-all duration-300 ease-in-out",
                  isActive
                    ? "bg-white/10 text-white font-black"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-4"
                )}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileOpen?.(false)}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1.5 h-6 bg-brand-red rounded-none"
                  />
                )}
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 3 : 2.5}
                  className={cn(
                    "shrink-0 transition-all duration-300 group-hover:scale-110",
                    isActive ? "text-white" : "text-white/40 group-hover:text-white"
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
        <div className={cn("py-4 border-t border-white/5 bg-white/5 backdrop-blur-sm flex flex-col gap-2", isCollapsed && !isMobileOpen ? "px-0" : "px-4")}>
          <Link
            href="/profile"
            className={cn(
              "flex items-center h-12 px-4 rounded-none transition-all duration-300",
              pathname === '/profile'
                ? "bg-[#1E5FA8] text-white font-black"
                : "text-white/60 hover:bg-white/5 hover:text-white",
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
              "flex items-center h-12 px-4 rounded-none text-white/50 hover:bg-red-500/10 hover:text-red-400 group transition-all duration-300",
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
          className="hidden lg:flex absolute top-[24px] right-[-12px] w-6 h-6 bg-white border border-slate-200 text-[var(--brand-navy)] items-center justify-center hover:bg-[var(--brand-navy)] hover:text-white transition-all z-10 rounded-none shadow-none"
        >
          {isCollapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
        </button>
      </aside>
    </>
  );
}

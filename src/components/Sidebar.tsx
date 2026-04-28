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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 lg:static z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-28" : "w-72"
        )}
      >
        <div className="h-[calc(100vh-2rem)] m-4 rounded-[2.5rem] glass-panel-navy flex flex-col overflow-hidden relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
          {/* Subdued ambient glow in background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-gold/10 blur-[100px] rounded-full" />
          
          {/* Brand logo */}
          <div className={cn(
            "p-8 flex items-center transition-all duration-500 relative z-10",
            isCollapsed && !isMobileOpen ? "justify-center" : "justify-start gap-4"
          )}>
            <BrandedLogo 
              variant="monogram" 
              isDark={true}
              className={cn(
                "transition-all duration-500",
                isCollapsed && !isMobileOpen ? "scale-90" : "scale-100"
              )} 
            />
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-white font-black tracking-tight text-xl">KP-AMS</span>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">v2.4.0 Intel</span>
              </motion.div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar relative z-10">
            {filteredNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center group relative h-12 px-4 rounded-2xl transition-all duration-300 ease-in-out",
                    isActive 
                      ? "bg-white/10 text-white font-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" 
                      : "text-white/50 hover:bg-white/5 hover:text-white",
                    isCollapsed ? "justify-center px-0" : "justify-start gap-4"
                  )}
                  title={isCollapsed ? item.name : undefined}
                  onClick={() => setIsMobileOpen?.(false)}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-transparent rounded-2xl border-l-2 border-brand-gold shadow-[0_0_20px_rgba(0,123,255,0.1)]" 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 3 : 2}
                    className={cn(
                      "shrink-0 transition-all duration-300 group-hover:scale-110 relative z-10",
                      isActive ? "text-brand-gold drop-shadow-[0_0_8px_rgba(0,123,255,0.5)]" : "group-hover:text-white"
                    )} 
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="font-black tracking-[0.15em] text-[10px] uppercase relative z-10">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Profile & Logout */}
          <div className="p-6 border-t border-white/5 bg-black/20 backdrop-blur-md flex flex-col gap-2 relative z-10">
            <Link
              href="/profile"
              className={cn(
                "flex items-center h-12 px-4 rounded-2xl transition-all duration-300",
                pathname === '/profile' 
                  ? "bg-white/10 text-white font-black" 
                  : "text-white/40 hover:bg-white/5 hover:text-white",
                isCollapsed ? "justify-center px-0" : "justify-start gap-4"
              )}
              title={isCollapsed ? "Profile Settings" : undefined}
              onClick={() => setIsMobileOpen?.(false)}
            >
              <UserCog size={20} strokeWidth={2} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="font-black tracking-[0.1em] text-[10px] uppercase">Profile & Ops</span>}
            </Link>
            
            <button
              onClick={() => {
                if (confirm('Log out from KP AMS?')) {
                  logout();
                  window.location.href = '/login';
                }
              }}
              className={cn(
                "flex items-center h-12 px-4 rounded-2xl text-white/30 hover:bg-rose-500/10 hover:text-rose-400 group transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "justify-start gap-4"
              )}
              title={isCollapsed ? "Logout Session" : undefined}
            >
              <LogOut size={20} strokeWidth={2} className="shrink-0 group-hover:translate-x-1 transition-transform" />
              {(!isCollapsed || isMobileOpen) && <span className="font-black tracking-[0.1em] text-[10px] uppercase">Disconnect</span>}
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex absolute top-[40px] right-4 w-8 h-8 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl items-center justify-center border border-white/10 transition-all z-20 group"
          >
            {isCollapsed ? <ChevronRight size={16} className="group-hover:scale-125 transition-transform" /> : <ChevronLeft size={16} className="group-hover:scale-125 transition-transform" />}
          </button>
        </div>
      </aside>
    </>
  );
}

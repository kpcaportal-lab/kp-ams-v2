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
  Shield,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  TrendingUp,
  Calendar as CalendarIcon,
  HardDrive
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Insights', href: '/insights', icon: TrendingUp, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager'] },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Proposals', href: '/proposals', icon: FileText, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Assignments', href: '/assignments', icon: ClipboardList, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Vault', href: '/documents', icon: HardDrive, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Billing', href: '/billing', icon: Receipt, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Tickets', href: '/tickets', icon: LifeBuoy, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'] },
  { name: 'Users', href: '/users', icon: UserCog, roles: ['admin', 'partner', 'director'] },
  { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin', 'partner', 'director', 'manager', 'assistant_manager'] },
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
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Building2 size={22} className="text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 leading-tight tracking-tight text-lg">KP AMS</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">CORE V2</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-1.5 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center group relative h-11 px-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  isCollapsed ? "justify-center" : "justify-start gap-3.5"
                )}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileOpen?.(false)}
              >
                {isActive && (
                  <div className="absolute left-[-4px] top-2 bottom-2 w-1.5 bg-blue-600 rounded-full shadow-[2px_0_8px_rgba(37,99,235,0.4)]" />
                )}
                <item.icon 
                  size={20} 
                  className={cn(
                    "shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  )} 
                />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="text-sm tracking-tight">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile & Logout */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-1.5">
          <Link
            href="/profile"
            className={cn(
              "flex items-center h-11 px-3 rounded-xl transition-all duration-200",
              pathname === '/profile' 
                ? "bg-white text-blue-600 font-bold shadow-sm" 
                : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm",
              isCollapsed ? "justify-center" : "justify-start gap-3.5"
            )}
            title={isCollapsed ? "Profile Settings" : undefined}
            onClick={() => setIsMobileOpen?.(false)}
          >
            <UserCog size={20} className="shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm tracking-tight">Profile</span>}
          </Link>
          
          <button
            onClick={() => {
              if (confirm('Log out from KP AMS?')) {
                logout();
                window.location.href = '/login';
              }
            }}
            className={cn(
              "flex items-center h-11 px-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 group transition-all duration-200",
              isCollapsed ? "justify-center" : "justify-start gap-3.5"
            )}
            title={isCollapsed ? "Logout Session" : undefined}
          >
            <LogOut size={20} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm tracking-tight font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute top-[24px] right-[-14px] w-7 h-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all z-10"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}

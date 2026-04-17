'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Search, User as UserIcon, Menu, Bell, ChevronRight } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { cn } from '@/lib/utils';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return (
        <span key={part} className="flex items-center">
          <span className={cn(
            "text-sm font-medium transition-colors",
            isLast ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"
          )}>
            {label}
          </span>
          {!isLast && <ChevronRight size={14} className="mx-2 text-slate-300" />}
        </span>
      );
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] flex items-center justify-between px-6 bg-white/70 backdrop-blur-md border-b border-slate-200/60">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} />
        </button>
        
        <nav className="hidden md:flex items-center">
          {getBreadcrumbs()}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search - Expandable on focus */}
        <div className="relative group hidden lg:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="w-64 focus:w-80 h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-700"
          />
        </div>

        <NotificationCenter />

        {/* User Profile */}
        <div 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              {user?.full_name || 'Guest User'}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {user?.role || 'Viewer'}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              {user?.full_name ? user.full_name.charAt(0) : <UserIcon size={20} />}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

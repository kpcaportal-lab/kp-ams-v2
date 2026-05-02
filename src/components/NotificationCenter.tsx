'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Ticket, ClipboardList, Shield, Info, X, Clock, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchNotifications]);

  const handleToggle = () => setIsOpen(!isOpen);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket_update': return <Ticket className="text-brand-red" size={16} />;
      case 'assignment_update': return <ClipboardList className="text-brand-navy" size={16} />;
      case 'system': return <Shield className="text-brand-navy" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    if (n.entity_type === 'ticket') {
      router.push('/tickets');
      setIsOpen(false);
    } else if (n.entity_type === 'assignment') {
      router.push('/assignments');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className={cn(
          "relative w-10 h-10 flex items-center justify-center rounded-none border transition-all active:scale-95",
          isOpen 
            ? "bg-brand-navy border-brand-navy text-white" 
            : "bg-white border-slate-200 text-slate-500 hover:text-brand-navy hover:border-brand-navy"
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand-red text-white text-[10px] font-extrabold rounded-none flex items-center justify-center border border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 w-[360px] max-h-[520px] bg-white border border-slate-200 shadow-none rounded-none z-50 overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-brand-navy">
              <div>
                <h3 className="text-sm font-extrabold text-white">Notifications</h3>
                <p className="text-[10px] !text-slate-200 font-bold uppercase tracking-widest">{unreadCount} UNREAD MESSAGES</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-[11px] font-extrabold text-white/80 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-none hover:bg-white/10 transition-colors uppercase tracking-wider"
                >
                  <Check size={14} strokeWidth={3} /> Mark all read
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center px-8 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-none flex items-center justify-center mb-4 border border-slate-100">
                    <Bell className="text-slate-200" size={32} />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">All caught up!</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">No new notifications at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "group relative px-5 py-4 flex gap-4 transition-all cursor-pointer border-l-2",
                        n.is_read 
                          ? "opacity-70 hover:opacity-100 border-transparent" 
                          : "bg-slate-50 hover:bg-slate-100 border-brand-red"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-none shrink-0 flex items-center justify-center border transition-all",
                        n.is_read 
                          ? "bg-slate-50 border-slate-100 group-hover:bg-white" 
                          : "bg-white border-slate-200 group-hover:border-brand-red"
                      )}>
                        {getNotificationIcon(n.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <p className={cn(
                            "text-sm leading-snug",
                            n.is_read ? "text-slate-600 font-medium" : "text-slate-900 font-bold"
                          )}>
                            {n.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-bold">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => { router.push('/profile'); setIsOpen(false); }}
                className="w-full py-2.5 rounded-none bg-white border border-slate-200 text-[11px] font-extrabold text-brand-navy uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-[0.98]"
              >
                Settings & Preferences
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

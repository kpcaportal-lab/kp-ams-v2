'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // Setting up click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchNotifications]);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div className="notification-center" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={handleToggle}
        style={{ 
          position: 'relative', 
          width: 40, height: 40, 
          borderRadius: 8, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isOpen ? 'var(--bg-muted)' : 'var(--bg-surface)', 
          border: '1px solid var(--border-default)',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          transition: 'all 0.2s'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 18, height: 18, borderRadius: 9,
            padding: '0 4px',
            background: 'var(--color-danger)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg-surface)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 320,
          maxHeight: 400,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--border-default)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                style={{ 
                  background: 'none', border: 'none', color: 'var(--color-primary)', 
                  fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 
                }}
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1, padding: 0 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No notifications yet.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map((n) => (
                  <li 
                    key={n.id}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-default)',
                      background: n.is_read ? 'var(--bg-surface)' : 'var(--bg-muted)',
                      cursor: n.is_read ? 'default' : 'pointer',
                      display: 'flex',
                      gap: '12px',
                    }}
                  >
                    {!n.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--color-primary)', marginTop: 6, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

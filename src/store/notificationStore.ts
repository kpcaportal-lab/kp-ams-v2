import { create } from 'zustand';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

export interface Notification {
    id: string;
    message: string;
    type: string;
    entity_type?: string;
    entity_id?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get<Notification[]>('/api/notifications');
            const notifications = Array.isArray(response.data) ? response.data : [];
            const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;
            set({ notifications, unreadCount });
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            const message = getErrorMessage(error);
            toast.error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            const updated = get().notifications.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            );
            set({
                notifications: updated,
                unreadCount: updated.filter(n => !n.is_read).length
            });
        } catch (error) {
            console.error('Failed to read notification', error);
            const message = getErrorMessage(error);
            toast.error(message);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.post(`/api/notifications/read-all`);
            const updated = get().notifications.map(n => ({ ...n, is_read: true }));
            set({ notifications: updated, unreadCount: 0 });
        } catch (error) {
            console.error('Failed to mark all as read', error);
            const message = getErrorMessage(error);
            toast.error(message);
        }
    }
}));

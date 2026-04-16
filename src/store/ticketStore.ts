import { create } from 'zustand';
import api from '../lib/api';

export interface Ticket {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    submitted_by_name?: string;
    created_at: string;
}

interface TicketStore {
    tickets: Ticket[];
    isLoading: boolean;
    fetchTickets: () => Promise<void>;
    createTicket: (data: Partial<Ticket>) => Promise<void>;
    updateTicketStatus: (id: string, status: string) => Promise<void>;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
    tickets: [],
    isLoading: false,
    fetchTickets: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/tickets');
            set({ tickets: res.data });
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            set({ isLoading: false });
        }
    },
    createTicket: async (data) => {
        try {
            const res = await api.post('/tickets', data);
            set({ tickets: [res.data, ...get().tickets] });
        } catch (error) {
            console.error('Failed to create ticket', error);
            throw error;
        }
    },
    updateTicketStatus: async (id, status) => {
        try {
            const res = await api.patch(`/tickets/${id}`, { status });
            // Only update local copy if strictly needed or refetch
            // We'll update the local object
            const updated = get().tickets.map(t => 
                t.id === id ? { ...t, status: res.data.status } : t
            );
            set({ tickets: updated });
        } catch (error) {
            // handle
        }
    }
}));

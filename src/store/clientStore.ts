import { create } from 'zustand';
import { Client } from '@/types';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

interface ClientStore {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  fetchClientById: (id: string) => Promise<Client | null>;
  addClient: (client: Partial<Client>) => Promise<Client | void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/clients');
      set({ clients: response.data, isLoading: false });
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchClientById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/clients/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  addClient: async (client) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/clients', client);
      set((state) => ({
        clients: [response.data, ...state.clients],
        isLoading: false
      }));
      return response.data;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateClient: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/clients/${id}`, updates);
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? response.data : c)),
        isLoading: false
      }));
      toast.success('Client updated successfully');
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  deleteClient: async (id) => {
    // Note: Backend might not have delete yet, but keeping store logic ready
    set({ isLoading: true, error: null });
    try {
      // await api.delete(`/api/clients/${id}`);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        isLoading: false
      }));
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  }
}));

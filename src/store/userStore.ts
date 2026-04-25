import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

interface UserState {
  partners: User[];
  managers: User[];
  isLoading: boolean;
  error: string | null;
  fetchPartners: () => Promise<void>;
  fetchManagers: () => Promise<void>;
  getPartnerById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>()((set, get) => ({
  partners: [],
  managers: [],
  isLoading: false,
  error: null,

  fetchPartners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/users/partners');
      set({ partners: response.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  fetchManagers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/users/managers');
      set({ managers: response.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  getPartnerById: (id) => get().partners.find(p => p.id === id),
}));

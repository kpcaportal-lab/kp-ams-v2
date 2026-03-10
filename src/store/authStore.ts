'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/api/auth/login', { email, password });
          const { token, user } = res.data;

          localStorage.setItem('kp_token', token);
          document.cookie = `kp_token=${token}; path=/; max-age=86400; SameSite=Lax`;

          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          const error = err as {
            message?: string;
            response?: { data?: { details?: string; error?: string }; status?: number };
          };
          const message =
            error.response?.data?.details ||
            error.response?.data?.error ||
            error.message ||
            'Login failed';
          throw new Error(message);
        }
      },

      logout: () => {
        localStorage.removeItem('kp_token');
        document.cookie = 'kp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'kp-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

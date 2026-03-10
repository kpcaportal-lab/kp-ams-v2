import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

// Mock Profiles (Partners) based on schema
const initialPartners: User[] = [
  { id: 'p1', full_name: 'Sneha Patel', email: 'sneha@kandp.in', role: 'partner', display_name: 'Sneha Patel (Partner)' },
  { id: 'p2', full_name: 'Sameer Shah', email: 'sameer@kandp.in', role: 'partner', display_name: 'Sameer Shah (Partner)' },
  { id: 'p3', full_name: 'Anjali Sharma', email: 'anjali@kandp.in', role: 'partner', display_name: 'Anjali Sharma (Partner)' },
  { id: 'p4', full_name: 'Vikram Mehta', email: 'vikram@kandp.in', role: 'partner', display_name: 'Vikram Mehta' },
  { id: 'd1', full_name: 'Amit Verma', email: 'amit@kandp.in', role: 'director', display_name: 'Amit Verma (Director)' },
];

interface UserState {
  partners: User[];
  isLoading: boolean;
  getPartnerById: (id: string) => User | undefined;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      partners: initialPartners,
      isLoading: false,
      getPartnerById: (id) => get().partners.find(p => p.id === id),
    }),
    {
      name: 'kp-users',
    }
  )
);

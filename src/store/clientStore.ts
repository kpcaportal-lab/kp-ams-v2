import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client } from '@/types';

// Mock data
const initialClients: Client[] = [
  {
    id: 'c1',
    name: 'TechCorp India Pvt. Ltd.',
    industry: 'Technology',
    status: 'active',
    spocName: 'Anand Kumar',
    spocEmail: 'anand@techcorp.in',
    spocPhone: '+91 9876543210',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Global Logistics Solutions',
    industry: 'Logistics',
    status: 'active',
    spocName: 'Rajesh Sharma',
    spocEmail: 'rajesh@globallogistics.com',
    spocPhone: '+91 9876512345',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'c3',
    name: 'Innovate Retail Partners',
    industry: 'Retail',
    status: 'inactive',
    spocName: 'Priya Desai',
    spocEmail: 'priya@innovateretail.com',
    spocPhone: '+91 9988776655',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  }
];

interface ClientState {
  clients: Client[];
  isLoading: boolean;
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: initialClients,
      isLoading: false,
      addClient: (newClient) => 
        set((state) => ({
          clients: [
            ...state.clients,
            {
              ...newClient,
              id: `c${Date.now()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Client
          ]
        })),
      updateClient: (id, updatedFields) =>
        set((state) => ({
          clients: state.clients.map(c => 
            c.id === id ? { ...c, ...updatedFields, updated_at: new Date().toISOString() } : c
          )
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter(c => c.id !== id)
        }))
    }),
    {
      name: 'kp-clients',
    }
  )
);

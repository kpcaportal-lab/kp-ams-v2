import { create } from 'zustand';
import { Invoice } from '@/types';
import api from '@/lib/api';

interface BillingStore {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
}

export const useBillingStore = create<BillingStore>((set) => ({
  invoices: [],
  loading: false,
  fetchInvoices: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/api/invoices');
      set({ invoices: res.data, loading: false });
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      set({ loading: false });
    }
  },
  addInvoice: (invoice) =>
    set((state) => ({ invoices: [invoice, ...state.invoices] })),
  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    })),
}));

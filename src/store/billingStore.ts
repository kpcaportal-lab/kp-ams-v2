import { create } from 'zustand';
import { Invoice } from '@/types';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface BillingStore {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoiceData: any) => Promise<Invoice | null>;
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
  addInvoice: async (invoiceData) => {
    set({ loading: true });
    try {
      // Backend expects { invoices: [...] } array format
      const res = await api.post('/api/invoices', { invoices: [invoiceData] });
      const createdInvoice = res.data.invoices?.[0] || null;
      if (createdInvoice) {
        set((state) => ({
          invoices: [createdInvoice, ...state.invoices],
          loading: false,
        }));
        toast.success('Invoice generated successfully');
      } else {
        set({ loading: false });
      }
      return createdInvoice;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to generate invoice';
      console.error('Failed to create invoice:', err);
      set({ loading: false });
      toast.error(message);
      return null;
    }
  },
  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    })),
}));

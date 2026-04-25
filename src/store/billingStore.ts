import { create } from 'zustand';
import { Invoice } from '@/types';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

interface BillingStore {
  invoices: Invoice[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoiceData: Partial<Invoice>) => Promise<Invoice | null>;
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
      const message = getErrorMessage(err);
      toast.error(message);
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
    } catch (err: unknown) {
      const message = getErrorMessage(err);
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

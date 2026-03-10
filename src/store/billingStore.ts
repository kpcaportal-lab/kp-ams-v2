import { create } from 'zustand';
import { Invoice } from '@/types';

interface BillingStore {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
}

const initialInvoices: Invoice[] = [
  {
    id: 'inv1',
    assignment_id: 'a1',
    invoice_date: '2025-05-10T10:00:00Z',
    udin: '25123456ABCDEF1234',
    kind_attention: 'Mr. Rajesh Kumar',
    reference: 'PO-2025-001',
    address: '123 Tech Park, Bengaluru, Karnataka 560001',
    gst_no: '29ABCDE1234F1Z5',
    new_sales_ledger: 'Audit Fees - Domestic',
    narration: 'Professional fees for Internal Audit Q1 2025-26',
    professional_fees: 150000,
    out_of_pocket: 5000,
    net_amount: 182900, // (150000 + 5000) + 18% GST
    batch_id: 'batch_001',
    generated_by: 'p1',
    created_at: '2025-05-10T10:00:00Z',
    client_name: 'TechCorp Solutions',
    email_status: 'sent',
  },
  {
    id: 'inv2',
    assignment_id: 'a2',
    invoice_date: '2025-06-15T11:30:00Z',
    udin: '25987654XYZABC9876',
    kind_attention: 'Ms. Anita Sharma',
    reference: 'PO-2025-042',
    address: '456 Business Centre, Mumbai, Maharashtra 400051',
    gst_no: '27ZYXWV9876U1T2',
    new_sales_ledger: 'Tax Advisory',
    narration: 'Professional fees for Tax Advisory services',
    professional_fees: 75000,
    out_of_pocket: 0,
    net_amount: 88500, // 75000 + 18% GST
    generated_by: 'p2',
    created_at: '2025-06-15T11:30:00Z',
    client_name: 'Global Industries',
    email_status: 'pending',
  }
];

export const useBillingStore = create<BillingStore>((set) => ({
  invoices: initialInvoices,
  addInvoice: (invoice) =>
    set((state) => ({ invoices: [...state.invoices, invoice] })),
  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    })),
}));

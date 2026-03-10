import { create } from 'zustand';
import { Assignment } from '@/types';

interface AssignmentStore {
  assignments: Assignment[];
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
}

const initialAssignments: Assignment[] = [
  {
    id: 'a1',
    client_id: 'c1',
    client_name: 'TechCorp Solutions',
    gstn: '12ABCDE3456F7GH',
    category: 'A',
    subcategory: 'statutory_audit',
    total_fees: 1500000,
    billing_cycle: 'quarterly',
    partner_id: 'p1',
    partner_name: 'Sneha Patel',
    manager_id: 'm1',
    manager_name: 'Anand Kumar',
    status: 'active',
    start_date: '2025-04-01',
    end_date: '2026-03-31',
    fiscal_year: '2025-26',
    created_at: '2025-03-01T10:00:00Z',
    allocations: [
      { id: 'al1', assignment_id: 'a1', month: 6, fiscal_year: '2025-26', amount: 500000, billed_amount: 0 },
      { id: 'al2', assignment_id: 'a1', month: 9, fiscal_year: '2025-26', amount: 500000, billed_amount: 0 },
      { id: 'al3', assignment_id: 'a1', month: 12, fiscal_year: '2025-26', amount: 500000, billed_amount: 0 },
    ]
  },
  {
    id: 'a2',
    client_id: 'c2',
    client_name: 'Global Industries',
    gstn: '23HIJKL4567M8NO',
    category: 'C',
    subcategory: 'internal_audit',
    total_fees: 2800000,
    billing_cycle: 'monthly',
    partner_id: 'p2',
    partner_name: 'Rahul Khanna',
    manager_id: 'm2',
    manager_name: 'Priya Rajan',
    status: 'draft',
    start_date: '2025-06-01',
    end_date: '2026-05-31',
    fiscal_year: '2025-26',
    created_at: '2025-03-05T14:30:00Z',
  },
  {
    id: 'a3',
    client_id: 'c3',
    client_name: 'Nexus Retail',
    gstn: '34ZPQR5678S9TU',
    category: 'B',
    subcategory: 'ifc_testing',
    total_fees: 850000,
    billing_cycle: 'one_time',
    partner_id: 'p1',
    partner_name: 'Sneha Patel',
    manager_id: 'm3',
    manager_name: 'Vikram Singh',
    status: 'completed',
    start_date: '2024-10-01',
    end_date: '2025-02-28',
    fiscal_year: '2024-25',
    created_at: '2024-09-15T09:15:00Z',
  }
];

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: initialAssignments,
  addAssignment: (assignment) =>
    set((state) => ({ assignments: [...state.assignments, assignment] })),
  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
}));

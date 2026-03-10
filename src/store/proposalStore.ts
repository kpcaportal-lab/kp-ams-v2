import { create } from 'zustand';
import { Proposal, ProposalStatus } from '@/types';

interface ProposalStore {
  proposals: Proposal[];
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  updateProposalStatus: (id: string, status: 'won' | 'lost' | 'pending') => void;
  reviseProposal: (id: string, revisionDetails: string, revisedFee: number) => void;
}

const initialProposals: Proposal[] = [
  {
    id: 'prop1',
    number: 'PRP-2025-001',
    client_id: 'c1',
    client_name: 'TechCorp Solutions',
    proposal_type: 'new',
    assignment_type: 'internal_audit',
    quotation_amount: 1500000,
    fee_category: 'new',
    proposal_date: '2025-02-15T09:00:00Z',
    prepared_by: 'm1',
    prepared_by_name: 'Anand Kumar',
    responsible_partner: 'p1',
    partner_name: 'Sneha Patel',
    status: 'won',
    status_date: '2025-03-01T10:00:00Z',
    revision_flag: false,
    version_number: 1,
    fiscal_year: '2025-26',
    created_at: '2025-02-15T09:00:00Z',
  },
  {
    id: 'prop2',
    number: 'PRP-2025-002',
    client_id: 'c2',
    client_name: 'Global Industries',
    proposal_type: 'renewal',
    assignment_type: 'internal_audit',
    quotation_amount: 2800000,
    fee_category: 'increment',
    increment_details: '10% standard inflation adjustment',
    revised_fee: 2800000,
    proposal_date: '2025-03-10T11:30:00Z',
    prepared_by: 'm2',
    prepared_by_name: 'Priya Rajan',
    responsible_partner: 'p2',
    partner_name: 'Rahul Khanna',
    status: 'pending',
    revision_flag: true,
    revision_details: 'Client requested scope reduction for Q4',
    version_number: 2,
    fiscal_year: '2025-26',
    created_at: '2025-03-01T08:00:00Z',
    updated_at: '2025-03-10T11:30:00Z',
  },
  {
    id: 'prop3',
    number: 'PRP-2024-055',
    client_id: 'c3',
    client_name: 'Nexus Retail',
    proposal_type: 'new',
    assignment_type: 'ifc',
    quotation_amount: 1200000,
    fee_category: 'new',
    proposal_date: '2024-08-01T14:15:00Z',
    prepared_by: 'm3',
    prepared_by_name: 'Vikram Singh',
    responsible_partner: 'p1',
    partner_name: 'Sneha Patel',
    status: 'lost',
    status_date: '2024-09-01T10:00:00Z',
    revision_flag: false,
    version_number: 1,
    notes: 'Lost to competitor on pricing',
    fiscal_year: '2024-25',
    created_at: '2024-08-01T14:15:00Z',
  }
];

export const useProposalStore = create<ProposalStore>((set) => ({
  proposals: initialProposals,
  addProposal: (proposal) =>
    set((state) => ({ proposals: [...state.proposals, proposal] })),
  updateProposal: (id, updates) =>
    set((state) => ({
      proposals: state.proposals.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  updateProposalStatus: (id, status) =>
    set((state) => ({
      proposals: state.proposals.map((p) => 
        p.id === id ? { ...p, status, status_date: new Date().toISOString() } : p
      ),
    })),
  reviseProposal: (id, revisionDetails, revisedFee) =>
    set((state) => {
      const original = state.proposals.find(p => p.id === id);
      if (!original) return state;

      const newVersion = {
        ...original,
        id: `prop-${Date.now()}`,
        parent_proposal_id: original.parent_proposal_id || original.id,
        version_number: original.version_number + 1,
        revision_flag: true,
        revision_details: revisionDetails,
        revised_fee: revisedFee,
        status: 'pending' as ProposalStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return {
        proposals: [...state.proposals, newVersion]
      };
    }),
}));

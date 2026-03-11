import { create } from 'zustand';
import { Proposal, ProposalStatus } from '@/types';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface ProposalStore {
  proposals: Proposal[];
  isLoading: boolean;
  error: string | null;
  fetchProposals: (filters?: any) => Promise<void>;
  fetchProposalById: (id: string) => Promise<Proposal | null>;
  addProposal: (proposal: Partial<Proposal>) => Promise<Proposal | null>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>;
  updateProposalStatus: (id: string, status: ProposalStatus, gstn?: string) => Promise<void>;
  reviseProposal: (id: string, details: string, revisedFee?: number) => Promise<Proposal | null>;
  generateAssignments: (id: string, data: any) => Promise<void>;
}

export const useProposalStore = create<ProposalStore>((set, get) => ({
  proposals: [],
  isLoading: false,
  error: null,

  fetchProposals: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/proposals', { params: filters });
      set({ proposals: response.data, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch proposals';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchProposalById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/proposals/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch proposal details';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  addProposal: async (proposal) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/proposals', proposal);
      set((state) => ({
        proposals: [response.data, ...state.proposals],
        isLoading: false
      }));
      toast.success('Proposal created successfully');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create proposal';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  updateProposal: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/proposals/${id}`, updates);
      set((state) => ({
        proposals: state.proposals.map((p) => (p.id === id ? (response.data as Proposal) : p)),
        isLoading: false
      }));
      toast.success('Proposal updated successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update proposal';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  updateProposalStatus: async (id, status, gstn) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/api/proposals/${id}/status`, { status, gstn });
      set((state) => ({
        proposals: state.proposals.map((p) => (p.id === id ? { ...p, status, status_date: new Date().toISOString() } : p)),
        isLoading: false
      }));
      toast.success(`Proposal marked as ${status}`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update status';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  reviseProposal: async (id, details, revisedFee) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/api/proposals/${id}/revise`, { 
        revision_details: details,
        revised_fee: revisedFee 
      });
      set((state) => ({
        proposals: [response.data, ...state.proposals],
        isLoading: false
      }));
      toast.success('New revision created');
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create revision';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  generateAssignments: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/api/proposals/${id}/generate-assignments`, data);
      set({ isLoading: false });
      toast.success('Assignments generated successfully');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to generate assignments';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
}));

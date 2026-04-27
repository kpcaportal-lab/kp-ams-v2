import { create } from 'zustand';
import type { ProposalTemplate } from '@/types';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

interface TemplateState {
  templates: ProposalTemplate[];
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  getTemplatesByType: (type: string) => ProposalTemplate[];
}

export const useTemplateStore = create<TemplateState>()((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/proposals/templates');
      set({ templates: response.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  getTemplatesByType: (type) => get().templates.filter(t => t.assignment_type === type),
}));

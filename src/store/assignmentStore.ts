import { create } from 'zustand';
import { Assignment } from '@/types';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AssignmentStore {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<Assignment | null>;
  addAssignment: (assignment: Partial<Assignment>) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  isLoading: false,
  error: null,

  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/assignments');
      set({ assignments: response.data, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch assignments';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchAssignmentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/assignments/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch assignment details';
      set({ error: message, isLoading: false });
      toast.error(message);
      return null;
    }
  },

  addAssignment: async (assignment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/assignments', assignment);
      set((state) => ({
        assignments: [response.data, ...state.assignments],
        isLoading: false
      }));
      toast.success('Assignment created successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create assignment';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  updateAssignment: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/assignments/${id}`, updates);
      set((state) => ({
        assignments: state.assignments.map((a) => (a.id === id ? response.data : a)),
        isLoading: false
      }));
      toast.success('Assignment updated successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update assignment';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
}));

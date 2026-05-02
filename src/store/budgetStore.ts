import { create } from 'zustand';
import api from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export interface BudgetSummary {
    fiscal_year: string;
    total_proposals: number;
    proposals_won: number;
    total_pipeline_value: number;
    total_won_value: number;
    conversion_rate: number;
}

export interface ComparativeData {
    fiscal_year: string;
    won_value: number;
    pipeline_value: number;
    proposal_count: number;
    yoy_growth: number;
}

export interface ForecastingData {
    projected_growth_rate: number;
    current_value: number;
    projected_next_year_value: number;
    confidence_level: 'High' | 'Low';
}

interface BudgetStore {
    summary: BudgetSummary | null;
    comparative: ComparativeData[];
    forecasting: ForecastingData | null;
    isLoading: boolean;
    error: string | null;
    fetchSummary: (fiscalYear: string) => Promise<void>;
    fetchComparative: () => Promise<void>;
    fetchForecasting: (currentFy: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
    summary: null,
    comparative: [],
    forecasting: null,
    isLoading: false,
    error: null,

    fetchSummary: async (fiscalYear) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/api/budget/summary', { params: { fiscal_year: fiscalYear } });
            set({ summary: response.data, isLoading: false });
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    fetchComparative: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/api/budget/comparative');
            set({ comparative: response.data, isLoading: false });
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },

    fetchForecasting: async (currentFy) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/api/budget/forecasting', { params: { current_fy: currentFy } });
            set({ forecasting: response.data, isLoading: false });
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            set({ error: message, isLoading: false });
            toast.error(message);
        }
    },
}));

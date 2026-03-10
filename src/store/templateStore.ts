import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProposalTemplate } from '@/types';

// Mock Templates based on schema
const initialTemplates: ProposalTemplate[] = [
  { 
    id: 't1', 
    name: 'Internal Audit Standard Template', 
    assignment_type: 'internal_audit',
    template_file_path: '/templates/ia_standard.pptx',
    prefilled_fields: {},
    required_fields: ['client_name', 'quotation_amount'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  { 
    id: 't2', 
    name: 'Forensic Investigation Proposal', 
    assignment_type: 'forensic',
    template_file_path: '/templates/forensic_v1.pptx',
    prefilled_fields: {},
    required_fields: ['client_name', 'scope_areas'],
    is_active: true,
    created_at: new Date().toISOString()
  },
  { 
    id: 't3', 
    name: 'IFC Testing Scope Template', 
    assignment_type: 'ifc',
    template_file_path: '/templates/ifc_v2.pptx',
    prefilled_fields: {},
    required_fields: ['client_name', 'fiscal_year'],
    is_active: true,
    created_at: new Date().toISOString()
  },
];

interface TemplateState {
  templates: ProposalTemplate[];
  isLoading: boolean;
  getTemplatesByType: (type: string) => ProposalTemplate[];
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: initialTemplates,
      isLoading: false,
      getTemplatesByType: (type) => get().templates.filter(t => t.assignment_type === type),
    }),
    {
      name: 'kp-templates',
    }
  )
);

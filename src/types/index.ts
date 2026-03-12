// ═══════════════════════════════════════════════════════════════════
// KP-AMS TypeScript Types & Helpers
// ═══════════════════════════════════════════════════════════════════

// ── User & Auth ─────────────────────────────────────────────────
export type UserRole = 'admin' | 'partner' | 'director' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  display_name?: string;
}

// ── Client ──────────────────────────────────────────────────────
export type ClientStatus = 'prospect' | 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  gstn?: string;
  status: ClientStatus;
  notes?: string;
  added_by?: string;
  added_by_name?: string;
  created_at: string;
  updated_at: string;
  
  // UI-specific or joined fields
  industry?: string;
  spocName?: string;
  spocEmail?: string;
  spocPhone?: string;
  spocs?: ClientSpoc[];
}

export interface ClientSpoc {
  id: string;
  client_id: string;
  contact_name: string;
  email: string;
  phone: string;
  designation?: string;
  is_primary: boolean;
  is_active: boolean;
}

// ── Proposal ────────────────────────────────────────────────────
export type ProposalType = 'new' | 'renewal';
export type AssignmentType = 'internal_audit' | 'forensic' | 'overseas' | 'mcs' | 'ifc';
export type FeeCategory = 'continuation' | 'increment' | 'new';
export type ProposalStatus = 'pending' | 'won' | 'lost' | 'pending_revision';

export interface ProposalScope {
  scope_of_work: string;
  user_details: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  assignment_type: AssignmentType;
  template_file_path: string;
  prefilled_fields: Record<string, unknown>;
  required_fields: string[];
  is_active: boolean;
  created_at: string;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version_number: number;
  snapshot: unknown;
  changes_summary: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface Proposal {
  id: string;
  number: string;
  client_id: string;
  client_name?: string;
  client_gstn?: string;
  proposal_type: ProposalType;
  assignment_type: AssignmentType;
  scope_areas?: string;
  quotation_amount: number;
  fee_category?: FeeCategory;
  increment_details?: string;
  revised_fee?: number;
  proposal_date: string;
  prepared_by: string;
  prepared_by_name?: string;
  responsible_partner: string;
  partner_name?: string;
  status: ProposalStatus;
  status_date?: string;
  revision_flag: boolean;
  revision_details?: string;
  template_id?: string;
  version_number: number;
  parent_proposal_id?: string;
  versions?: ProposalVersion[];
  assignment_count?: number;
  notes?: string;
  fiscal_year: string;
  created_at: string;
  updated_at?: string;
}

// ── Assignment ──────────────────────────────────────────────────
export type AssignmentCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type AssignmentSubcategory =
  | 'compliance' | 'tax_filing' | 'statutory_audit' | 'internal_audit'
  | 'advisory' | 'ifc_testing' | 'forensic_investigation'
  | 'transfer_pricing' | 'gst' | 'fema' | 'company_law'
  | 'due_diligence' | 'valuations' | 'certification' | 'other';

export type BillingCycle = 'monthly' | 'quarterly' | 'annually' | 'one_time' | 'as_when';
export type AssignmentStatus = 'draft' | 'active' | 'completed' | 'postponed';

export interface Assignment {
  id: string;
  proposal_id?: string;
  proposal_number?: string;
  client_id: string;
  client_name?: string;
  gstn: string;
  category: AssignmentCategory;
  subcategory: AssignmentSubcategory;
  assessment_year?: string;
  scope_item?: string;
  scope_areas?: string;
  total_fees: number;
  billing_cycle: BillingCycle;
  partner_id: string;
  partner_name?: string;
  manager_id: string;
  manager_name?: string;
  manager_email?: string;
  status: AssignmentStatus;
  start_date?: string;
  end_date?: string;
  fiscal_year: string;
  notes?: string;
  created_at: string;
  allocations?: FeeAllocation[];
  invoices?: Invoice[];
  history?: ChangeHistoryEntry[];
}

export interface FeeAllocation {
  id: string;
  assignment_id: string;
  month: number;
  fiscal_year: string;
  amount: number;
  billed_amount: number;
}

// ── Invoice ─────────────────────────────────────────────────────
export interface Invoice {
  id: string;
  assignment_id: string;
  invoice_date: string;
  udin?: string;
  kind_attention?: string;
  reference?: string;
  address?: string;
  gst_no?: string;
  new_sales_ledger?: string;
  narration: string;
  professional_fees: number;
  out_of_pocket: number;
  net_amount: number;
  batch_id?: string;
  generated_by?: string;
  created_at: string;
  client_name?: string;
  email_status?: string;
}

// ── Change History ──────────────────────────────────────────────
export interface ChangeHistoryEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  changed_by_name?: string;
  reason?: string;
  changed_at: string;
}

// ── Dashboard ───────────────────────────────────────────────────
export interface PartnerBreakdown {
  id: string;
  full_name: string;
  display_name?: string;
  billed: number;
}

export interface ManagerBreakdown {
  id: string;
  full_name: string;
  display_name?: string;
  billed_amount: number;
  billing_pct: number;
}

export interface CategoryBreakdown {
  category: AssignmentCategory;
  billed: number;
  billing_pct: number;
}

export interface DashboardSummary {
  totalBilled: number;
  selfBilled: number;
  overdue: number;
  billingPct: number;
  selfBillingPct: number;
  partnerBreakdown: PartnerBreakdown[];
  managerBreakdown: ManagerBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
}

// ── Work Progress ───────────────────────────────────────────────
export interface WorkProgressItem {
  client_name: string;
  proposal_amount: number;
  billing_status: 'done' | 'pending';
  tentative_date?: string;
  assignment_type?: string;
  responsible_person?: string;
}

export interface UserWorkProgress {
  user_id: string;
  user_name: string;
  display_name?: string;
  total_proposals: number;
  completed_proposals: number;
  pending_proposals: number;
  completed_percentage: number;
  pending_percentage: number;
  total_amount: number;
  completed_amount: number;
  pending_amount: number;
  completed_items: WorkProgressItem[];
  pending_items: WorkProgressItem[];
}

// ═══════════════════════════════════════════════════════════════════
// LABEL MAPS & HELPERS
// ═══════════════════════════════════════════════════════════════════

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  internal_audit: 'Internal Audit',
  forensic: 'Forensic',
  overseas: 'Overseas',
  mcs: 'Management Consultancy',
  ifc: 'IFC Testing',
};

export const CATEGORY_LABELS: Record<AssignmentCategory, string> = {
  A: 'Routine Internal Audits',
  B: 'IFC Testing',
  C: 'Forensic Audits',
  D: 'One Time Assignments',
  E: 'Africa Assignments',
  F: 'Special Assignments',
};

export const SUBCATEGORY_LABELS: Record<AssignmentSubcategory, string> = {
  compliance: 'Compliance',
  tax_filing: 'Tax Filing',
  statutory_audit: 'Statutory Audit',
  internal_audit: 'Internal Audit',
  advisory: 'Advisory',
  ifc_testing: 'IFC Testing',
  forensic_investigation: 'Forensic Investigation',
  transfer_pricing: 'Transfer Pricing',
  gst: 'GST',
  fema: 'FEMA',
  company_law: 'Company Law',
  due_diligence: 'Due Diligence',
  valuations: 'Valuations',
  certification: 'Certification',
  other: 'Other',
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
  one_time: 'One Time',
  as_when: 'As and When',
};

export const FISCAL_MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
];

/** Format a number as Indian Rupees, e.g. ₹1,23,456 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

/** Format a date string as "09 Mar 2026" */
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

import { Proposal, Assignment, AssignmentStatus, AssignmentCategory, AssignmentSubcategory, BillingCycle } from '@/types';

/**
 * Maps a Proposal to a list of Assignments based on its assignment_type.
 */
export function mapProposalToAssignments(proposal: Proposal): Omit<Assignment, 'id' | 'created_at'>[] {
  const commonFields = {
    proposal_id: proposal.id,
    proposal_number: proposal.number,
    client_id: proposal.client_id,
    client_name: proposal.client_name,
    gstn: proposal.client_gstn || 'N/A',
    partner_id: proposal.responsible_partner,
    partner_name: proposal.partner_name,
    manager_id: proposal.prepared_by,
    manager_name: proposal.prepared_by_name,
    status: 'draft' as AssignmentStatus,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year default
    total_fees: proposal.quotation_amount,
    billing_cycle: 'one_time' as BillingCycle,
    fiscal_year: proposal.fiscal_year,
  };

  // Map Proposal AssignmentType to Assignment Category and Subcategory
  let category: AssignmentCategory = 'D'; // Default: One Time
  let subcategory: AssignmentSubcategory = 'other';

  switch (proposal.assignment_type) {
    case 'internal_audit':
      category = 'A';
      subcategory = 'internal_audit';
      break;
    case 'ifc':
      category = 'B';
      subcategory = 'ifc_testing';
      break;
    case 'forensic':
      category = 'C';
      subcategory = 'forensic_investigation';
      break;
    case 'overseas':
      category = 'E';
      subcategory = 'other';
      break;
    case 'mcs':
      category = 'F';
      subcategory = 'advisory';
      break;
  }

  return [
    {
      ...commonFields,
      category,
      subcategory,
      scope_areas: proposal.scope_areas,
      notes: proposal.notes,
    }
  ];
}

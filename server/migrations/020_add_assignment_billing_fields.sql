-- ============================================================
-- Migration 020: Add billed_amount & out_of_pocket to assignments table
-- Also purge AI-generated demo/seed data from 002_seed.sql
-- ============================================================

-- 1) Add billed_amount and out_of_pocket columns to assignments
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(14,2) DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS out_of_pocket NUMERIC(14,2) DEFAULT 0;

-- 2) Purge demo invoices (from seed file)
DELETE FROM invoices WHERE id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003'
);

-- 3) Purge demo fee allocations (from seed file)
DELETE FROM fee_allocations WHERE assignment_id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005'
);

-- 4) Purge demo assignments (from seed file)
DELETE FROM assignments WHERE id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005'
);

-- 5) Purge demo proposals (from seed file)
DELETE FROM proposals WHERE id IN (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000005',
  '20000000-0000-0000-0000-000000000006',
  '20000000-0000-0000-0000-000000000007'
);

-- 6) Purge demo client SPOCs (from seed file)
DELETE FROM client_spocs WHERE client_id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);

-- 7) Purge demo clients (from seed file)
DELETE FROM clients WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);

-- 8) Purge demo proposal sequences (from seed file)
DELETE FROM proposal_sequences WHERE fiscal_year = '2025-26' AND assignment_type IN ('internal_audit', 'forensic', 'ifc', 'overseas', 'mcs');

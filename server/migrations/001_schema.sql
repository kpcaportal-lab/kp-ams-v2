-- ============================================================
-- KP AMS — Complete Database Schema
-- Run this in Supabase SQL Editor or via migrate script
-- ============================================================

-- Cleanup (for re-runs)
DROP TABLE IF EXISTS work_progress CASCADE;
DROP TABLE IF EXISTS proposal_versions CASCADE;
DROP TABLE IF EXISTS proposal_templates CASCADE;
DROP TABLE IF EXISTS change_history CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS fee_adjustments CASCADE;
DROP TABLE IF EXISTS fee_allocations CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS proposal_sequences CASCADE;
DROP TABLE IF EXISTS client_spocs CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ENUM TYPES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'partner', 'director', 'manager', 'staff');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE client_status AS ENUM ('prospect', 'active', 'inactive');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE proposal_type AS ENUM ('renewal', 'new');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_type AS ENUM ('internal_audit', 'forensic', 'overseas', 'mcs', 'ifc');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE fee_category AS ENUM ('continuation', 'increment', 'new');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE proposal_status AS ENUM ('pending', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_category AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'annually', 'one_time', 'as_when');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM ('draft', 'active', 'completed', 'postponed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE adjustment_type AS ENUM ('postponed_prev_year', 'fee_increase', 'fee_reduction', 'addition', 'continuation');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE email_status AS ENUM ('sent', 'failed', 'pending');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- TABLE: profiles (system users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'manager',
  full_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  gstn VARCHAR(15),
  status client_status DEFAULT 'prospect',
  added_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: client_spocs
-- ============================================================
CREATE TABLE client_spocs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  designation VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: proposal_sequences (for auto-numbering)
-- ============================================================
CREATE TABLE proposal_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_type assignment_type NOT NULL,
  fiscal_year VARCHAR(10) NOT NULL,
  last_sequence INT DEFAULT 0,
  UNIQUE(assignment_type, fiscal_year)
);

-- ============================================================
-- TABLE: proposals
-- ============================================================
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(30) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  proposal_type proposal_type NOT NULL DEFAULT 'new',
  assignment_type assignment_type NOT NULL,
  scope_areas TEXT,
  quotation_amount NUMERIC(14,2) NOT NULL,
  fee_category fee_category,
  increment_details TEXT,
  revised_fee NUMERIC(14,2),
  proposal_date DATE NOT NULL,
  prepared_by UUID NOT NULL REFERENCES profiles(id),
  responsible_partner UUID NOT NULL REFERENCES profiles(id),
  status proposal_status DEFAULT 'pending',
  status_date DATE,
  revision_flag BOOLEAN DEFAULT false,
  revision_details TEXT,
  file_url TEXT,
  notes TEXT,
  fiscal_year VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: assignments
-- ============================================================
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID UNIQUE REFERENCES proposals(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  gstn VARCHAR(15) NOT NULL,
  category assignment_category NOT NULL,
  scope_areas TEXT,
  total_fees NUMERIC(14,2) NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  partner_id UUID NOT NULL REFERENCES profiles(id),
  manager_id UUID NOT NULL REFERENCES profiles(id),
  status assignment_status DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  fiscal_year VARCHAR(10) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: fee_allocations (12 per assignment per FY)
-- ============================================================
CREATE TABLE fee_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  fiscal_year VARCHAR(10) NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  billed_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, month, fiscal_year)
);

-- ============================================================
-- TABLE: fee_adjustments
-- ============================================================
CREATE TABLE fee_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  adjustment_type adjustment_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  reason TEXT,
  proposal_reference VARCHAR(50),
  effective_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: invoices
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  sr_no SERIAL,
  invoice_date DATE NOT NULL,
  udin VARCHAR(100),
  kind_attention VARCHAR(255),
  reference TEXT,
  address TEXT,
  gst_no VARCHAR(15),
  new_sales_ledger TEXT,
  narration TEXT NOT NULL,
  professional_fees NUMERIC(14,2) NOT NULL,
  out_of_pocket NUMERIC(14,2) DEFAULT 0,
  net_amount NUMERIC(14,2) NOT NULL,
  batch_id UUID,
  generated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: email_logs
-- ============================================================
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  recipient VARCHAR(255) NOT NULL,
  cc VARCHAR(255),
  subject TEXT NOT NULL,
  body_html TEXT,
  status email_status DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_msg TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: change_history (immutable audit trail)
-- ============================================================
CREATE TABLE change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_proposals_client ON proposals(client_id);
CREATE INDEX idx_proposals_prepared_by ON proposals(prepared_by);
CREATE INDEX idx_proposals_partner ON proposals(responsible_partner);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_assignments_client ON assignments(client_id);
CREATE INDEX idx_assignments_manager ON assignments(manager_id);
CREATE INDEX idx_assignments_partner ON assignments(partner_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_fee_allocations_assignment ON fee_allocations(assignment_id);
CREATE INDEX idx_invoices_assignment ON invoices(assignment_id);
CREATE INDEX idx_change_history_entity ON change_history(entity_type, entity_id);

-- ============================================================
-- FUNCTION: update updated_at on all tables
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_proposals_updated BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fee_allocations_updated BEFORE UPDATE ON fee_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

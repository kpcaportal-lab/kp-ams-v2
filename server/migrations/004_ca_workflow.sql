-- ============================================================
-- KP AMS — CA Workflow Features Migration
-- Adds: proposal_versions, proposal_templates, assignment subcategories,
--        reversible proposal status, multi-assignment support
-- ============================================================

-- ── New ENUM: assignment_subcategory ─────────────────────────
DO $$ BEGIN
  CREATE TYPE assignment_subcategory AS ENUM (
    'compliance', 'tax_filing', 'statutory_audit', 'internal_audit',
    'advisory', 'ifc_testing', 'forensic_investigation',
    'transfer_pricing', 'gst', 'fema', 'company_law',
    'due_diligence', 'valuations', 'certification', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- TABLE: proposal_versions (revision history snapshots)
-- ============================================================
CREATE TABLE IF NOT EXISTS proposal_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  snapshot JSONB NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_proposal_versions_proposal ON proposal_versions(proposal_id);

-- ============================================================
-- TABLE: proposal_templates (PPT reference templates)
-- ============================================================
CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  assignment_type assignment_type NOT NULL,
  template_file_path TEXT,
  prefilled_fields JSONB DEFAULT '{}',
  required_fields JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALTER proposals: add version tracking + parent link + template
-- ============================================================
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS version_number INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_proposal_id UUID REFERENCES proposals(id),
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES proposal_templates(id);

-- ============================================================
-- ALTER assignments: drop UNIQUE on proposal_id for 1:many,
-- add subcategory, assessment_year, scope_item
-- ============================================================

-- Drop the UNIQUE constraint on proposal_id to allow multiple assignments per proposal
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assignments_proposal_id_key'
  ) THEN
    ALTER TABLE assignments DROP CONSTRAINT assignments_proposal_id_key;
  END IF;
END $$;

-- Add new columns
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS subcategory assignment_subcategory DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS assessment_year VARCHAR(10),
  ADD COLUMN IF NOT EXISTS scope_item TEXT;

-- ============================================================
-- INDEXES for new columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_assignments_subcategory ON assignments(subcategory);
CREATE INDEX IF NOT EXISTS idx_assignments_assessment_year ON assignments(assessment_year);

-- ============================================================
-- Seed a default template entry pointing to the existing PPT
-- ============================================================
INSERT INTO proposal_templates (name, assignment_type, template_file_path)
VALUES ('KPCA Standard Proposal', 'internal_audit', 'templates/091_KPCA_EPPS Infotech Ltd_Proposal.pptx')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TRIGGERS for new tables
-- ============================================================
DROP TRIGGER IF EXISTS trg_proposal_templates_updated ON proposal_templates;
CREATE TRIGGER trg_proposal_templates_updated
  BEFORE UPDATE ON proposal_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

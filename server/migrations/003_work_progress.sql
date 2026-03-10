-- ============================================================
-- KP AMS — Work Progress Table Migration
-- Adds work_progress table to store user-specific work progress data
-- ============================================================

-- ============================================================
-- TABLE: work_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS work_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fiscal_year VARCHAR(10) NOT NULL,
  total_proposals INT NOT NULL DEFAULT 0,
  completed_proposals INT NOT NULL DEFAULT 0,
  pending_proposals INT NOT NULL DEFAULT 0,
  completed_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  percentage_completed NUMERIC(5,2) NOT NULL DEFAULT 0,
  tentative_dates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fiscal_year)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_work_progress_user ON work_progress(user_id);
CREATE INDEX idx_work_progress_fiscal_year ON work_progress(fiscal_year);

-- ============================================================
-- TRIGGER for updated_at
-- ============================================================
CREATE TRIGGER trg_work_progress_updated BEFORE UPDATE ON work_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at();
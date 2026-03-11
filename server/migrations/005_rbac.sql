-- ============================================================
-- KP AMS — RBAC Migration
-- Adds: reports_to hierarchy, audit_logs table
-- ============================================================

-- ── 1. Add reports_to column for director→manager hierarchy ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_profiles_reports_to ON profiles(reports_to);

-- ── 2. Audit Logs table (tracks user actions, NOT field changes) ──
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  user_email VARCHAR(255),
  user_role VARCHAR(20),
  action VARCHAR(50) NOT NULL,           -- login, logout, create, update, delete, view, export
  entity_type VARCHAR(50),               -- assignment, proposal, client, invoice, user
  entity_id UUID,
  details JSONB DEFAULT '{}',            -- extra context (e.g. changed fields, filters used)
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

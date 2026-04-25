-- Migration to add created_by to assignments for better visibility control
ALTER TABLE assignments ADD COLUMN created_by UUID REFERENCES profiles(id);

-- Backfill existing assignments: set created_by to partner_id or manager_id
UPDATE assignments SET created_by = COALESCE(partner_id, manager_id);

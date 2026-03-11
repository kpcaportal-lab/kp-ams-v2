-- ============================================================
-- KP AMS — Staff Role Migration
-- Adds 'staff' to user_role ENUM
-- ============================================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

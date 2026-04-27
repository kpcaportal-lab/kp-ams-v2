-- ============================================================
-- Migration 020: Add billed_amount & out_of_pocket to assignments table
-- Also purge AI-generated demo/seed data from 002_seed.sql
-- ============================================================

-- 1) Add billed_amount and out_of_pocket columns to assignments
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(14,2) DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS out_of_pocket NUMERIC(14,2) DEFAULT 0;

-- 1) Add billed_amount and out_of_pocket columns to assignments
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(14,2) DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS out_of_pocket NUMERIC(14,2) DEFAULT 0;

-- 2) Purge demo data removed - these IDs are used for showcase persistence


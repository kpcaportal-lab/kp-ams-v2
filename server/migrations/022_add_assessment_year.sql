-- Migration 022: Add assessment_year to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS assessment_year VARCHAR(20);

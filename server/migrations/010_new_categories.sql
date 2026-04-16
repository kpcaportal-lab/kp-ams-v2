-- Migration: Add new assignment categories (G and H)
-- Description: Phase 4 requested SOP Designing and Management Consulting

ALTER TYPE assignment_category ADD VALUE IF NOT EXISTS 'G';
ALTER TYPE assignment_category ADD VALUE IF NOT EXISTS 'H';

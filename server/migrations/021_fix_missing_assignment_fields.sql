-- Migration 021: Fix missing fields in assignments table
-- These were requested but missed in previous migrations

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS amount_receipt NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Verify columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'amount_receipt') THEN
        RAISE EXCEPTION 'Column amount_receipt was not created';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'file_url') THEN
        RAISE EXCEPTION 'Column file_url was not created';
    END IF;
END $$;

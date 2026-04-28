-- Migration 024: Add manager_id to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id);

-- Verify column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'manager_id') THEN
        RAISE EXCEPTION 'Column manager_id was not created in proposals table';
    END IF;
END $$;

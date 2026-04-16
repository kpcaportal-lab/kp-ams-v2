-- 008_client_fields_and_roles.sql

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS billing_details TEXT;

-- Add new roles to user_role ENUM
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'assistant_manager';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'executive';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'sr_executive';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE 'analyst';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

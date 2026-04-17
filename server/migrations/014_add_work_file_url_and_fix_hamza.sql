-- Migration: Add work_file_url and Fix Hamza Momin
-- Description: Add column for profile files and update Hamza Momin's role/data

-- 1. Add column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_file_url TEXT;

-- 2. Correct Hamza Momin's role and display name, and associate the file
-- Using both emails known for him to be safe
UPDATE profiles 
SET role = 'manager',
    display_name = 'Hamza Momin',
    work_file_url = '/For Dev.xlsb',
    updated_at = NOW()
WHERE email IN ('hamza.momin@kpis.co.in', 'hamza.momin@kirtanepandit.com') 
   OR full_name = 'Hamza Momin';

-- 3. Log the change in audit_logs (optional but good practice)
-- Note: This is a direct SQL migration, normally code handles audit logs, 
-- but we can insert a manual entry if desired.

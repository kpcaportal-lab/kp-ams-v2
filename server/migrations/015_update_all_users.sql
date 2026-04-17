-- ============================================================
-- Migration 015: Update All Users with Real Names & Roles
-- Maps organizational hierarchy to existing profile slots
-- ============================================================

-- 1. Ensure work_file_url column exists (idempotent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_file_url TEXT;

-- ============================================================
-- 2. Update existing placeholder profiles with REAL user data
-- ============================================================

-- ADMIN (Super Admin) — keep as-is, just ensure active
UPDATE profiles SET is_active = true, updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- PARTNER: Milind Limaye (slot: Partner 1 → ID 0002)
UPDATE profiles SET 
    full_name = 'Milind Limaye',
    display_name = 'Milind Limaye',
    email = 'milind.limaye@kirtanepandit.com',
    role = 'partner',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000002';

-- PARTNER: Tanmay Bodhe (slot: Partner 2 → ID 0003)
UPDATE profiles SET 
    full_name = 'Tanmay Bodhe',
    display_name = 'Tanmay Bodhe',
    email = 'tanmay.bodhe@kirtanepandit.com',
    role = 'partner',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000003';

-- DIRECTOR: Rishabh Thakkar (slot: Director 1 → ID 0005)
UPDATE profiles SET 
    full_name = 'Rishabh Thakkar',
    display_name = 'Rishabh Thakkar',
    email = 'rishabh.thakkar@kirtanepandit.com',
    role = 'director',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000005';

-- MANAGER: Sanjeev Deshpande (slot: Manager 1 → ID 0008)
UPDATE profiles SET 
    full_name = 'Sanjeev Deshpande',
    display_name = 'Sanjeev Deshpande',
    email = 'sanjeev.deshpande@kirtanepandit.com',
    role = 'manager',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000008';

-- MANAGER: Bhushan Patil (slot: Manager 2 → ID 0009)
UPDATE profiles SET 
    full_name = 'Bhushan Patil',
    display_name = 'Bhushan Patil',
    email = 'bhushan.patil@kirtanepandit.com',
    role = 'manager',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000009';

-- MANAGER: Mohit Joshi (slot: Manager 3 → ID 0010)
UPDATE profiles SET 
    full_name = 'Mohit Joshi',
    display_name = 'Mohit Joshi',
    email = 'mohit.joshi@kirtanepandit.com',
    role = 'manager',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000010';

-- MANAGER: Vibhuti Narang (slot: Manager 4 → ID 0011)
UPDATE profiles SET 
    full_name = 'Vibhuti Narang',
    display_name = 'Vibhuti Narang',
    email = 'vibhuti.narang@kirtanepandit.com',
    role = 'manager',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000011';

-- MANAGER: Hamza Momin (slot: Manager 5 → ID 0012)
-- Also associates work file
UPDATE profiles SET 
    full_name = 'Hamza Momin',
    display_name = 'Hamza Momin',
    email = 'hamza.momin@kirtanepandit.com',
    role = 'manager',
    is_active = true,
    work_file_url = '/hamzamominwork.xlsx',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000012';

-- MANAGER: Dhanashree Dekhane (slot: Manager 6 → ID 0013)
UPDATE profiles SET 
    full_name = 'Dhanashree Dekhane',
    display_name = 'Dhanashree Dekhane',
    email = 'dhanashree.dekhane@kirtanepandit.com',
    role = 'manager',
    is_active = true,
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000013';

-- ============================================================
-- 3. Reassign Partner 3 (ID 0004) references to Milind Limaye
--    before deactivating, so seed data stays valid
-- ============================================================
UPDATE proposals SET responsible_partner = '00000000-0000-0000-0000-000000000002'
WHERE responsible_partner = '00000000-0000-0000-0000-000000000004';

UPDATE assignments SET partner_id = '00000000-0000-0000-0000-000000000002'
WHERE partner_id = '00000000-0000-0000-0000-000000000004';

-- ============================================================
-- 4. Deactivate unused placeholder profiles
-- ============================================================

-- Partner 3 (unused)
UPDATE profiles SET is_active = false, updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000004';

-- Director 2, Director 3 (unused)
UPDATE profiles SET is_active = false, updated_at = NOW()
WHERE id IN (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007'
);

-- Manager 7-10 (unused)
UPDATE profiles SET is_active = false, updated_at = NOW()
WHERE id IN (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000017'
);

-- Staff 1 (unused)
UPDATE profiles SET is_active = false, updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000018';

-- ============================================================
-- 5. Clean up any duplicate Hamza entries from earlier migrations
--    (migrations 011/013 may have created a separate row)
-- ============================================================
UPDATE profiles SET is_active = false, updated_at = NOW()
WHERE (full_name = 'Hamza Momin' OR email ILIKE '%hamza.momin%')
  AND id != '00000000-0000-0000-0000-000000000012';

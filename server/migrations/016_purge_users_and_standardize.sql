-- ============================================================
-- Migration 016: Purge Placeholders & Standardize Accounts
-- 1. Standardize Emails to @gmail.com
-- 2. Set all passwords to 'KpAms@2025'
-- 3. Delete all non-real profiles after reassigning references
-- ============================================================

-- A. Standardize active users (Emails and Passwords)
-- Password Hash for 'KpAms@2025'
DO $$ 
DECLARE 
    gen_hash TEXT := '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS';
BEGIN

    -- 1. ADMIN
    UPDATE profiles SET 
        email = 'admin.kpams@gmail.com',
        password_hash = gen_hash,
        is_active = true
    WHERE id = '00000000-0000-0000-0000-000000000001';

    -- 2. Milind Limaye
    UPDATE profiles SET 
        email = 'milind.limaye@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000002';

    -- 3. Tanmay Bodhe
    UPDATE profiles SET 
        email = 'tanmay.bodhe@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000003';

    -- 4. Rishabh Thakkar
    UPDATE profiles SET 
        email = 'rishabh.thakkar@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000005';

    -- 5. Sanjeev Deshpande
    UPDATE profiles SET 
        email = 'sanjeev.deshpande@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000008';

    -- 6. Bhushan Patil
    UPDATE profiles SET 
        email = 'bhushan.patil@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000009';

    -- 7. Mohit Joshi
    UPDATE profiles SET 
        email = 'mohit.joshi@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000010';

    -- 8. Vibhuti Narang
    UPDATE profiles SET 
        email = 'vibhuti.narang@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000011';

    -- 9. Hamza Momin
    UPDATE profiles SET 
        email = 'hamza.momin@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000012';

    -- 10. Dhanashree Dekhane
    UPDATE profiles SET 
        email = 'dhanashree.dekhane@gmail.com',
        password_hash = gen_hash
    WHERE id = '00000000-0000-0000-0000-000000000013';

END $$;

-- B. Reassign references from placeholder users to ADMIN before deletion
-- This prevents Foreign Key constraint violations
DO $$ 
DECLARE 
    admin_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Reassign from all users NOT in our "Real 10" list
    CREATE TEMP TABLE to_purge AS
    SELECT id FROM profiles 
    WHERE id NOT IN (
        '00000000-0000-0000-0000-000000000001', -- Admin
        '00000000-0000-0000-0000-000000000002', -- Milind
        '00000000-0000-0000-0000-000000000003', -- Tanmay
        '00000000-0000-0000-0000-000000000005', -- Rishabh
        '00000000-0000-0000-0000-000000000008', -- Sanjeev
        '00000000-0000-0000-0000-000000000009', -- Bhushan
        '00000000-0000-0000-0000-000000000010', -- Mohit
        '00000000-0000-0000-0000-000000000011', -- Vibhuti
        '00000000-0000-0000-0000-000000000012', -- Hamza
        '00000000-0000-0000-0000-000000000013'  -- Dhanashree
    );

    -- Clients
    UPDATE clients SET added_by = admin_id WHERE added_by IN (SELECT id FROM to_purge);
    
    -- Proposals
    UPDATE proposals SET prepared_by = admin_id WHERE prepared_by IN (SELECT id FROM to_purge);
    UPDATE proposals SET responsible_partner = admin_id WHERE responsible_partner IN (SELECT id FROM to_purge);
    
    -- Assignments
    UPDATE assignments SET partner_id = admin_id WHERE partner_id IN (SELECT id FROM to_purge);
    UPDATE assignments SET manager_id = admin_id WHERE manager_id IN (SELECT id FROM to_purge);
    
    -- Invoices
    UPDATE invoices SET generated_by = admin_id WHERE generated_by IN (SELECT id FROM to_purge);
    
    -- Fee Adjustments
    UPDATE fee_adjustments SET created_by = admin_id WHERE created_by IN (SELECT id FROM to_purge);
    
    -- Change History
    UPDATE change_history SET changed_by = admin_id WHERE changed_by IN (SELECT id FROM to_purge);

    -- C. Finally, DELETE the purged profiles
    DELETE FROM profiles WHERE id IN (SELECT id FROM to_purge);

    DROP TABLE to_purge;
END $$;

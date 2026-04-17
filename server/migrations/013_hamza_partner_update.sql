-- Migration: Update Hamza Momin to Partner
-- Description: Correct email, display name, and role to partner

UPDATE profiles 
SET email = 'hamza.momin@kpis.co.in',
    display_name = 'Hamza Momin (Partner)',
    role = 'partner'
WHERE email = 'hamza.momin@kirtanepandit.com' OR full_name = 'Hamza Momin';

-- Ensure Hamza exists if the previous migration wasn't run or failed
INSERT INTO profiles (email, password_hash, full_name, display_name, role, is_active)
VALUES ('hamza.momin@kpis.co.in', '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS', 'Hamza Momin', 'Hamza Momin (Partner)', 'partner', true)
ON CONFLICT (email) DO UPDATE 
SET role = 'partner',
    display_name = 'Hamza Momin (Partner)',
    full_name = 'Hamza Momin';

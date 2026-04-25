-- Migration: 019 Restore Admin Credentials
-- Description: Restores the original admin email address changed by migration 016

UPDATE profiles 
SET email = 'admin@kirtanepandit.com',
    full_name = 'System Administrator',
    display_name = 'Admin',
    is_active = true
WHERE id = '00000000-0000-0000-0000-000000000001';

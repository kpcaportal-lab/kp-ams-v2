-- Migration: Seed Hamza Momin
-- Description: Insert demo user Hamza Momin with manager role and demo assignments

INSERT INTO profiles (email, password_hash, full_name, display_name, role, is_active)
VALUES ('hamza.momin@kirtanepandit.com', '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS', 'Hamza Momin', 'Hamza', 'manager', true)
ON CONFLICT (email) DO UPDATE 
SET role = 'manager',
    full_name = 'Hamza Momin';

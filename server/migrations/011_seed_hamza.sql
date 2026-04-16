-- Migration: Seed Hamza Momin
-- Description: Insert demo user Hamza Momin with manager role and demo assignments

INSERT INTO profiles (email, full_name, display_name, role, is_active)
VALUES ('hamza.momin@kirtanepandit.com', 'Hamza Momin', 'Hamza', 'manager', true)
ON CONFLICT (email) DO UPDATE 
SET role = 'manager',
    full_name = 'Hamza Momin';

-- Migration 023: Fix hierarchy and enable Document Vault
-- Sets reporting links and adds dummy file URLs for testing

-- 1. Fix Hierarchy
UPDATE profiles SET reports_to = '00000000-0000-0000-0000-000000000002' 
WHERE id IN (
  '00000000-0000-0000-0000-000000000008', -- Sanjeev Deshpande
  '00000000-0000-0000-0000-000000000009'  -- Bhushan Patil
);

UPDATE profiles SET reports_to = '00000000-0000-0000-0000-000000000003'
WHERE id IN (
  '00000000-0000-0000-0000-000000000010', -- Mohit Joshi
  '00000000-0000-0000-0000-000000000011'  -- Vibhuti Narang
);

UPDATE profiles SET reports_to = '00000000-0000-0000-0000-000000000005'
WHERE id IN (
  '00000000-0000-0000-0000-000000000012', -- Hamza Momin
  '00000000-0000-0000-0000-000000000013'  -- Dhanashree Dekhane
);

-- 2. Add dummy file_urls to enable Vault
UPDATE assignments SET file_url = 'https://example.com/audit_plan.pdf' WHERE id = '30000000-0000-0000-0000-000000000001';
UPDATE assignments SET file_url = 'https://example.com/field_work.docx' WHERE id = '30000000-0000-0000-0000-000000000002';
UPDATE assignments SET file_url = 'https://example.com/compliance_check.pdf' WHERE id = '30000000-0000-0000-0000-000000000003';
UPDATE assignments SET file_url = 'https://example.com/tax_report.pdf' WHERE id = '30000000-0000-0000-0000-000000000004';
UPDATE assignments SET file_url = 'https://example.com/final_audit.pdf' WHERE id = '30000000-0000-0000-0000-000000000005';

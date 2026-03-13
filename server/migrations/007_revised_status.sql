-- Add 'revised' to proposal_status ENUM
-- Note: In Postgres, adding a value to an enum is a non-blocker
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'revised';

-- 017_add_ticket_attachment.sql
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachment_url TEXT;

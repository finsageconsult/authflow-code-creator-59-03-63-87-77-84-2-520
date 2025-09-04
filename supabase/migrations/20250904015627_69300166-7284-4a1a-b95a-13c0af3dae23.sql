-- Add email column to access_codes table to track which email each code was sent to
ALTER TABLE access_codes ADD COLUMN email text;

-- Add index for better performance when checking duplicates
CREATE INDEX idx_access_codes_email_org ON access_codes(email, organization_id, expires_at) WHERE expires_at > NOW();
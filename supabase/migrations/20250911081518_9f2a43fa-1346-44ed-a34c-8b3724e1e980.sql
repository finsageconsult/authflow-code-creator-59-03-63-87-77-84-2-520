-- Add domain column to organizations table for email domain validation
ALTER TABLE public.organizations 
ADD COLUMN domain TEXT;

-- Add some sample domains for existing organizations
UPDATE public.organizations 
SET domain = 'finsage.co' 
WHERE name = 'Finsage Demo';

UPDATE public.organizations 
SET domain = 'rohitsaw.in' 
WHERE name = 'Rohitsaw';

-- Create index for faster domain lookups
CREATE INDEX idx_organizations_domain ON public.organizations(domain);

-- Create function to extract domain from email
CREATE OR REPLACE FUNCTION extract_email_domain(email TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT LOWER(SUBSTRING(email FROM '@(.*)$'));
$$;

-- Create function to check if domain is allowed (not free email provider)
CREATE OR REPLACE FUNCTION is_corporate_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT NOT (
    extract_email_domain(email) = ANY(ARRAY[
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'yahoo.co.in',
      'rediffmail.com', 'live.com', 'msn.com', 'aol.com', 'icloud.com',
      'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'fastmail.com'
    ])
  );
$$;
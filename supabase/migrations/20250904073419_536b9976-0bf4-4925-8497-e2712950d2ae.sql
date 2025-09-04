-- Allow coach access codes to be org-independent
ALTER TABLE public.access_codes
  ALTER COLUMN organization_id DROP NOT NULL;
-- Make organization_id nullable in coaching_sessions table to support individual users
ALTER TABLE public.coaching_sessions ALTER COLUMN organization_id DROP NOT NULL;
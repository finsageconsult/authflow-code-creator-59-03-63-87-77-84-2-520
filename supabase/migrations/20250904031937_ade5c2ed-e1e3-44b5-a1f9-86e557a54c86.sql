-- Add unique constraint to auth_id in users table
ALTER TABLE public.users ADD CONSTRAINT unique_auth_id UNIQUE (auth_id);
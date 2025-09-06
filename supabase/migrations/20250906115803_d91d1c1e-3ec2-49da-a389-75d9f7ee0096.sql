-- Add experience field to users table for coaches
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS experience TEXT;
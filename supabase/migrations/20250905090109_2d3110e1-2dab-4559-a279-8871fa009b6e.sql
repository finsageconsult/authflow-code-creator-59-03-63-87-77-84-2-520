-- Add specialties column to users table for coaches
ALTER TABLE public.users 
ADD COLUMN specialties text[] DEFAULT '{}';

-- Create an index on specialties for better performance
CREATE INDEX idx_users_specialties ON public.users USING GIN(specialties);

-- Add some sample specialties for existing coaches (optional)
UPDATE public.users 
SET specialties = CASE 
  WHEN role = 'COACH' THEN ARRAY['Financial Planning', 'Investment Strategy']
  ELSE specialties
END
WHERE role = 'COACH';
-- Add course_type column to individual_programs table
ALTER TABLE public.individual_programs 
ADD COLUMN course_type text DEFAULT 'individual';
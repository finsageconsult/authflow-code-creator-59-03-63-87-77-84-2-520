-- Add RLS policy to allow viewing active coaches for enrollment
CREATE POLICY "Anyone can view active coaches for enrollment"
ON public.users
FOR SELECT
USING (role = 'COACH' AND status = 'ACTIVE');
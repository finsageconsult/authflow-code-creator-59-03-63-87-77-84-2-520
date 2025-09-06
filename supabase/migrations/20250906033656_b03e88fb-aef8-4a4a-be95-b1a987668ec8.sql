-- Create helper function to avoid recursion in users policies
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Fix recursive users policies by replacing subqueries with the helper
DROP POLICY IF EXISTS "Coaches can view their students (via enrollments)" ON public.users;
DROP POLICY IF EXISTS "Coaches can view their students (via bookings)" ON public.users;
DROP POLICY IF EXISTS "Users can view own user row" ON public.users;

CREATE POLICY "Coaches can view their students (via enrollments)"
ON public.users
FOR SELECT
USING (
  get_current_user_role() = 'COACH'::user_role
  AND id IN (
    SELECT e.user_id
    FROM public.enrollments e
    WHERE e.coach_id = public.get_current_user_id()
  )
);

CREATE POLICY "Coaches can view their students (via bookings)"
ON public.users
FOR SELECT
USING (
  get_current_user_role() = 'COACH'::user_role
  AND id IN (
    SELECT b.user_id
    FROM public.individual_bookings b
    WHERE b.coach_id = public.get_current_user_id()
  )
);

-- Allow every authenticated user to view their own row
CREATE POLICY "Users can view own user row"
ON public.users
FOR SELECT
USING (
  id = public.get_current_user_id()
);

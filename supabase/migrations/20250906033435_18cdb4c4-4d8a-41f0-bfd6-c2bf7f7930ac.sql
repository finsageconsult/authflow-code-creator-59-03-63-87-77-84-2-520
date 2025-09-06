-- Ensure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow coaches to view users who are enrolled in their programs
DROP POLICY IF EXISTS "Coaches can view their students (via enrollments)" ON public.users;
CREATE POLICY "Coaches can view their students (via enrollments)"
ON public.users
FOR SELECT
USING (
  get_current_user_role() = 'COACH'::user_role
  AND id IN (
    SELECT e.user_id
    FROM public.enrollments e
    WHERE e.coach_id = (
      SELECT u.id FROM public.users u WHERE u.auth_id = auth.uid()
    )
  )
);

-- Allow coaches to view users who have bookings with them
DROP POLICY IF EXISTS "Coaches can view their students (via bookings)" ON public.users;
CREATE POLICY "Coaches can view their students (via bookings)"
ON public.users
FOR SELECT
USING (
  get_current_user_role() = 'COACH'::user_role
  AND id IN (
    SELECT b.user_id
    FROM public.individual_bookings b
    WHERE b.coach_id = (
      SELECT u.id FROM public.users u WHERE u.auth_id = auth.uid()
    )
  )
);

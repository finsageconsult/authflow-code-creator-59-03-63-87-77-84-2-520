-- Create RPC to fetch coach's students without hitting users RLS
CREATE OR REPLACE FUNCTION public.get_students_for_current_coach()
RETURNS TABLE(id uuid, name text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  with me as (
    select id from public.users where auth_id = auth.uid() limit 1
  )
  (
    select u.id, u.name, u.email
    from public.users u
    where u.id in (
      select e.user_id from public.enrollments e, me where e.coach_id = me.id
    )
  )
  union
  (
    select u.id, u.name, u.email
    from public.users u
    where u.id in (
      select b.user_id from public.individual_bookings b, me where b.coach_id = me.id
    )
  );
$$;
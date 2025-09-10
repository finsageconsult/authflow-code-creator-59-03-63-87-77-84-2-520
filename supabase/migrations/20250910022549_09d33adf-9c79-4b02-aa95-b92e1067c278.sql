-- Tighten security on users table and expose a safe public coach directory

-- 1) Ensure RLS is enabled and enforced on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- 2) Drop ALL existing policies on users to remove overly permissive access
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users;', pol.polname);
  END LOOP;
END$$;

-- 3) Create strict, role-aware policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = auth_id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (
  auth.uid() IN (
    SELECT u.auth_id FROM public.users u WHERE u.role = 'ADMIN'
  )
);

-- HR can view users in their organization
CREATE POLICY "HR can view users in their organization"
ON public.users
FOR SELECT
USING (
  organization_id IN (
    SELECT u.organization_id
    FROM public.users u
    WHERE u.auth_id = auth.uid() AND u.role IN ('HR','ADMIN')
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- 4) Public, column-limited coach directory via SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.get_public_coach_directory()
RETURNS TABLE (
  id uuid,
  name text,
  avatar_url text,
  specialties text[]
) LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.name,
    u.avatar_url,
    COALESCE(ARRAY(
      SELECT DISTINCT t
      FROM coaching_offerings co,
           LATERAL UNNEST(COALESCE(co.tags, '{}')) AS t
      WHERE co.coach_id = u.id AND co.is_active = true
    ), '{}') AS specialties
  FROM public.users u
  WHERE u.role = 'COACH' AND u.status = 'ACTIVE';
$$;

GRANT EXECUTE ON FUNCTION public.get_public_coach_directory() TO anon, authenticated;
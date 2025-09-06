-- Fix infinite recursion by dropping functions CASCADE and recreating with proper security
-- Drop functions with CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_current_user_org_id() CASCADE;

-- Recreate functions with proper SECURITY DEFINER and search_path to bypass RLS
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE sql  
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_current_user_org_id()  
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_current_user_id() TO public;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO public;
GRANT EXECUTE ON FUNCTION get_current_user_org_id() TO public;

-- Recreate the dropped policies that were dependent on these functions
CREATE POLICY "Users can view own user row" 
ON public.users 
FOR SELECT 
USING (id = get_current_user_id());

CREATE POLICY "Coaches can view their students (via enrollments)" 
ON public.users 
FOR SELECT 
USING (
  (get_current_user_role() = 'COACH'::user_role) 
  AND (id IN (
    SELECT e.user_id 
    FROM enrollments e 
    WHERE e.coach_id = get_current_user_id()
  ))
);

CREATE POLICY "Coaches can view their students (via bookings)" 
ON public.users 
FOR SELECT 
USING (
  (get_current_user_role() = 'COACH'::user_role) 
  AND (id IN (
    SELECT b.user_id 
    FROM individual_bookings b 
    WHERE b.coach_id = get_current_user_id()
  ))
);
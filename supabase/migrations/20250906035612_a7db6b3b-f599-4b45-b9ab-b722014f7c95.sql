-- Fix infinite recursion by dropping and recreating functions with CASCADE
-- This will drop the functions and all dependent policies, then recreate them properly

-- Drop functions with CASCADE to remove dependent policies
DROP FUNCTION IF EXISTS get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_current_user_org_id() CASCADE;

-- Recreate functions with SECURITY DEFINER to bypass RLS
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

-- Recreate the essential RLS policies that were dropped
-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (get_current_user_role() = 'ADMIN'::user_role);

-- HR policies
CREATE POLICY "HR can manage users in their org" ON public.users
  FOR ALL USING ((get_current_user_role() = 'HR'::user_role) AND (get_current_user_org_id() = organization_id));

-- Coach access policies
CREATE POLICY "Anyone can view active coaches for enrollment" ON public.users
  FOR SELECT USING ((role = 'COACH'::user_role) AND (status = 'ACTIVE'::user_status));
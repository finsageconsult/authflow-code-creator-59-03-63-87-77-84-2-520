-- Fix infinite recursion in users table RLS policies by recreating functions properly
-- Drop the existing functions first
DROP FUNCTION IF EXISTS get_current_user_id();
DROP FUNCTION IF EXISTS get_current_user_role();
DROP FUNCTION IF EXISTS get_current_user_org_id();

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

-- Grant execute permissions to public
GRANT EXECUTE ON FUNCTION get_current_user_id() TO public;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO public;
GRANT EXECUTE ON FUNCTION get_current_user_org_id() TO public;
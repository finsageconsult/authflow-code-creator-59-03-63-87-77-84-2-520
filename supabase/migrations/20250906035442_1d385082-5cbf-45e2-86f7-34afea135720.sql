-- Fix infinite recursion in users table RLS policies
-- The issue is that get_current_user_* functions query the users table,
-- which triggers RLS policies that call the same functions, creating infinite recursion

-- First, let's recreate the functions with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT
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
RETURNS TEXT
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
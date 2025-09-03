-- Fix infinite recursion in RLS policies by using security definer functions

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid();
$$;

-- Create security definer function to get current user organization ID
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.users WHERE auth_id = auth.uid();
$$;

-- Drop and recreate users policies to avoid recursion
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "HR can manage users in their org" ON users;

CREATE POLICY "Admins can manage all users" 
ON users 
FOR ALL
USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "HR can manage users in their org" 
ON users 
FOR ALL
USING (
  get_current_user_role() = 'HR' 
  AND get_current_user_org_id() = organization_id
);

-- Fix access_codes policies to use functions
DROP POLICY IF EXISTS "Admins can manage all access codes" ON access_codes;
DROP POLICY IF EXISTS "HR can manage access codes in their org" ON access_codes;

CREATE POLICY "Admins can manage all access codes" 
ON access_codes 
FOR ALL
USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "HR can manage access codes in their org" 
ON access_codes 
FOR ALL
USING (
  get_current_user_role() = 'HR' 
  AND get_current_user_org_id() = organization_id
);

-- Fix organizations policies  
DROP POLICY IF EXISTS "Admins can manage all organizations" ON organizations;

CREATE POLICY "Admins can manage all organizations" 
ON organizations 
FOR ALL
USING (get_current_user_role() = 'ADMIN');

-- Fix org_plans policies
DROP POLICY IF EXISTS "Admins can manage all org plans" ON org_plans;

CREATE POLICY "Admins can manage all org plans" 
ON org_plans 
FOR ALL
USING (get_current_user_role() = 'ADMIN');
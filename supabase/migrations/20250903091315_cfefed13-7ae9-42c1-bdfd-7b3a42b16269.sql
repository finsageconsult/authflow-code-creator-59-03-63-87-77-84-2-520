-- Drop existing problematic policies
DROP POLICY IF EXISTS "HR and Admins can manage users in their org" ON public.users;
DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.users WHERE auth_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create new RLS policies using security definer functions
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_id);

CREATE POLICY "HR and Admins can manage users in their org" 
ON public.users 
FOR ALL 
USING (
  public.get_current_user_role() IN ('ADMIN', 'HR') 
  AND public.get_current_user_org_id() = organization_id
);

CREATE POLICY "Users can view users in their organization" 
ON public.users 
FOR SELECT 
USING (
  public.get_current_user_org_id() IS NOT NULL 
  AND organization_id = public.get_current_user_org_id()
);
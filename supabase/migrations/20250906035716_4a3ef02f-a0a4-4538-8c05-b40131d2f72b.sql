-- Temporarily disable RLS to fix the infinite recursion issue
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Anyone can view active coaches for enrollment" ON public.users;
DROP POLICY IF EXISTS "Coaches can view their students (via bookings)" ON public.users;
DROP POLICY IF EXISTS "Coaches can view their students (via enrollments)" ON public.users;
DROP POLICY IF EXISTS "HR can manage users in their org" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own user row" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple non-recursive policies first
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON public.users  
  FOR UPDATE USING (auth.uid() = auth_id);

CREATE POLICY "Anyone can view active coaches for enrollment" ON public.users
  FOR SELECT USING ((role = 'COACH'::user_role) AND (status = 'ACTIVE'::user_status));

-- Now add policies that use the SECURITY DEFINER functions (these should work now)
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (get_current_user_role() = 'ADMIN'::user_role);

CREATE POLICY "HR can manage users in their org" ON public.users
  FOR ALL USING ((get_current_user_role() = 'HR'::user_role) AND (get_current_user_org_id() = organization_id));
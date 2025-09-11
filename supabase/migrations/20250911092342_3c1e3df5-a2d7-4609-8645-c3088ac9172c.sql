-- Fix RLS policies for organizations table to allow admins to create organizations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can manage all organizations" ON public.organizations;

-- Create comprehensive policies for organizations
CREATE POLICY "Admins can manage all organizations" 
ON public.organizations 
FOR ALL 
TO authenticated
USING (
  auth.uid() IN (
    SELECT users.auth_id 
    FROM users 
    WHERE users.role = 'ADMIN'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT users.auth_id 
    FROM users 
    WHERE users.role = 'ADMIN'
  )
);

-- Allow HR to view organizations in their own org
CREATE POLICY "HR can view their organization" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT users.organization_id 
    FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'HR'
  )
);
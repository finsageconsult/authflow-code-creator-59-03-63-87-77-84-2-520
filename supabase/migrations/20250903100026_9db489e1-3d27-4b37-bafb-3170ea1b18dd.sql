-- Update RLS policies to allow ADMIN users to see all organizations' data

-- Drop existing access_codes policies
DROP POLICY IF EXISTS "HR and Admins can manage access codes" ON access_codes;

-- Create new policies for access_codes
CREATE POLICY "Admins can manage all access codes" 
ON access_codes 
FOR ALL
USING (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'ADMIN'
  )
);

CREATE POLICY "HR can manage access codes in their org" 
ON access_codes 
FOR ALL
USING (
  auth.uid() IN (
    SELECT u.auth_id FROM users u 
    WHERE u.role = 'HR' 
    AND u.organization_id = access_codes.organization_id
  )
);

-- Drop existing users policies for HR/Admin management
DROP POLICY IF EXISTS "HR and Admins can manage users in their org" ON users;

-- Create new policies for users
CREATE POLICY "Admins can manage all users" 
ON users 
FOR ALL
USING (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'ADMIN'
  )
);

CREATE POLICY "HR can manage users in their org" 
ON users 
FOR ALL
USING (
  auth.uid() IN (
    SELECT u.auth_id FROM users u 
    WHERE u.role = 'HR' 
    AND u.organization_id = users.organization_id
  )
);

-- Update organizations policy for admins
DROP POLICY IF EXISTS "Admins can manage organizations" ON organizations;

CREATE POLICY "Admins can manage all organizations" 
ON organizations 
FOR ALL
USING (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'ADMIN'
  )
);

-- Update org_plans policy for admins  
DROP POLICY IF EXISTS "Admins can manage all org plans" ON org_plans;

CREATE POLICY "Admins can manage all org plans" 
ON org_plans 
FOR ALL
USING (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'ADMIN'
  )
);
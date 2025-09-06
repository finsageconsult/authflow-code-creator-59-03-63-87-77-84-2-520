-- Add admin policy for organizations table to allow admins to view all organizations
CREATE POLICY "Admins can view all organizations" 
ON organizations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- Add admin policy for org_plans table to allow admins to view all org plans
CREATE POLICY "Admins can view all org plans" 
ON org_plans 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);
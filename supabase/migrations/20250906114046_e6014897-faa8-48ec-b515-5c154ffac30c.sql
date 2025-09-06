-- Add admin policy for support_queries table to allow admins to view all support queries
CREATE POLICY "Admins can view all support queries" 
ON support_queries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);

-- Add admin policy for support_queries table to allow admins to update all support queries  
CREATE POLICY "Admins can update all support queries" 
ON support_queries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'ADMIN'
  )
);
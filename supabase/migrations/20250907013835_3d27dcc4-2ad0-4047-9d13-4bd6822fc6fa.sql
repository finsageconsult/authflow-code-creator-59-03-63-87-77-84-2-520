-- Add policy for admins to manage all webinars across organizations
CREATE POLICY "Admins can manage all webinars" 
ON public.webinars 
FOR ALL 
TO authenticated
USING (auth.uid() IN ( 
  SELECT users.auth_id
  FROM users
  WHERE users.role = 'ADMIN'::user_role
))
WITH CHECK (auth.uid() IN ( 
  SELECT users.auth_id
  FROM users
  WHERE users.role = 'ADMIN'::user_role
));
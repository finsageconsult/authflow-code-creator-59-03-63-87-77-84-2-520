-- Add DELETE policy for assignments table
CREATE POLICY "Users can delete assignments they created" 
ON public.assignments 
FOR DELETE 
USING (created_by IN ( 
  SELECT users.id
  FROM users
  WHERE users.auth_id = auth.uid()
));
-- Fix RLS policy for email_events table
-- This table should only be accessible by the system and admin users

CREATE POLICY "System and admins can manage email events" 
ON public.email_events 
FOR ALL 
USING (
  -- Allow system operations and admin users
  auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'ADMIN'
  ) OR
  -- Allow service role access for system operations
  auth.role() = 'service_role'
);
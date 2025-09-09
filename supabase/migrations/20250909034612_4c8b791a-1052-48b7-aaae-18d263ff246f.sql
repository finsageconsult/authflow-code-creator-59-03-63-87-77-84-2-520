-- Fix the RLS policy for coaches to view enrollments
-- The current policy might be too restrictive

DROP POLICY IF EXISTS "Coaches can view enrollments for their sessions" ON enrollments;

-- Create a more permissive policy for coaches to view all enrollments where they are the coach
CREATE POLICY "Coaches can view their assigned enrollments" 
ON enrollments 
FOR SELECT 
TO authenticated
USING (
  -- Allow coaches to see enrollments where they are assigned as coach
  coach_id IN (
    SELECT u.id 
    FROM users u 
    WHERE u.auth_id = auth.uid() 
    AND u.role = 'COACH'
  )
);

-- Also ensure coaches can view all enrollments in the date range regardless of status
-- This will help with calendar display
CREATE POLICY "Coaches can view enrollments for calendar display" 
ON enrollments 
FOR SELECT 
TO authenticated
USING (
  -- Allow coaches to see all enrollments (any status) for their sessions
  coach_id IN (
    SELECT u.id 
    FROM users u 
    WHERE u.auth_id = auth.uid() 
    AND u.role = 'COACH'
  )
);
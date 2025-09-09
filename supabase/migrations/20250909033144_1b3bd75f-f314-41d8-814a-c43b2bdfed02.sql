-- Create a function to get client names for coach sessions
CREATE OR REPLACE FUNCTION get_coach_client_names(coach_user_id uuid, client_ids uuid[])
RETURNS TABLE(id uuid, name text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.name, u.email
  FROM users u
  WHERE u.id = ANY(client_ids)
  AND (
    -- Allow if the client has enrollments with this coach
    EXISTS (
      SELECT 1 FROM enrollments e 
      WHERE e.user_id = u.id 
      AND e.coach_id = coach_user_id
    )
    OR
    -- Allow if the client has coaching sessions with this coach  
    EXISTS (
      SELECT 1 FROM coaching_sessions cs
      WHERE cs.client_id = u.id
      AND cs.coach_id = coach_user_id
    )
  );
$$;
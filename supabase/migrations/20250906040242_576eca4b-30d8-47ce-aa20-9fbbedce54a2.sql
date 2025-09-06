DROP FUNCTION IF EXISTS get_students_for_current_coach();

CREATE OR REPLACE FUNCTION get_students_for_current_coach()
RETURNS TABLE(id uuid, name text, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT DISTINCT u.id, u.name, u.email
  FROM users u
  WHERE u.id IN (
    -- Students from enrollments
    SELECT DISTINCT e.user_id 
    FROM enrollments e
    WHERE e.coach_id = (
      SELECT users.id 
      FROM users 
      WHERE users.auth_id = auth.uid() 
      LIMIT 1
    )
    UNION
    -- Students from individual bookings  
    SELECT DISTINCT b.user_id
    FROM individual_bookings b  
    WHERE b.coach_id = (
      SELECT users.id
      FROM users
      WHERE users.auth_id = auth.uid()
      LIMIT 1
    )
  )
  ORDER BY u.name;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_students_for_current_coach() TO authenticated;
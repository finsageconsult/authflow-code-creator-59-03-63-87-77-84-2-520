DROP FUNCTION IF EXISTS get_students_for_current_coach();

CREATE OR REPLACE FUNCTION get_students_for_current_coach()
RETURNS TABLE(
  id uuid, 
  name text, 
  email text, 
  user_type text,
  enrollments jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH coach_students AS (
    -- Students from enrollments
    SELECT DISTINCT u.id, u.name, u.email, 
           CASE 
             WHEN u.role = 'INDIVIDUAL' THEN 'Individual'
             WHEN u.role = 'EMPLOYEE' THEN 'Employee'
             ELSE 'User'
           END as user_type
    FROM users u
    INNER JOIN enrollments e ON u.id = e.user_id
    WHERE e.coach_id = (
      SELECT users.id 
      FROM users 
      WHERE users.auth_id = auth.uid() 
      LIMIT 1
    )
    UNION
    -- Students from individual bookings
    SELECT DISTINCT u.id, u.name, u.email,
           CASE 
             WHEN u.role = 'INDIVIDUAL' THEN 'Individual'
             WHEN u.role = 'EMPLOYEE' THEN 'Employee'
             ELSE 'User'
           END as user_type
    FROM users u
    INNER JOIN individual_bookings b ON u.id = b.user_id
    WHERE b.coach_id = (
      SELECT users.id
      FROM users
      WHERE users.auth_id = auth.uid()
      LIMIT 1
    )
  ),
  student_enrollments AS (
    SELECT 
      cs.id,
      cs.name,
      cs.email,
      cs.user_type,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', e.id,
            'program_title', COALESCE(ip.title, 'Financial Coaching Program'),
            'program_category', COALESCE(ip.category, 'coaching'),
            'enrollment_date', e.enrollment_date,
            'scheduled_at', e.scheduled_at,
            'status', e.status,
            'payment_status', e.payment_status
          )
          ORDER BY e.enrollment_date DESC
        ) FILTER (WHERE e.id IS NOT NULL),
        '[]'::jsonb
      ) as enrollments
    FROM coach_students cs
    LEFT JOIN enrollments e ON cs.id = e.user_id 
      AND e.coach_id = (
        SELECT users.id 
        FROM users 
        WHERE users.auth_id = auth.uid() 
        LIMIT 1
      )
    LEFT JOIN individual_programs ip ON e.course_id = ip.id
    GROUP BY cs.id, cs.name, cs.email, cs.user_type
  )
  SELECT 
    se.id,
    se.name,
    se.email,
    se.user_type,
    se.enrollments
  FROM student_enrollments se
  ORDER BY se.name;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_students_for_current_coach() TO authenticated;
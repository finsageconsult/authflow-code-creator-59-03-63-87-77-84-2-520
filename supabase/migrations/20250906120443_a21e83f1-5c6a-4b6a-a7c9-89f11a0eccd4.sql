-- Add RLS policies for ADMIN users to view all coaching data

-- Allow admins to view all coaching sessions
CREATE POLICY "Admins can view all coaching sessions" 
ON public.coaching_sessions 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IN (
    SELECT users.auth_id 
    FROM users 
    WHERE users.role = 'ADMIN'
  )
);

-- Allow admins to view all individual bookings  
CREATE POLICY "Admins can view all individual bookings" 
ON public.individual_bookings 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IN (
    SELECT users.auth_id 
    FROM users 
    WHERE users.role = 'ADMIN'
  )
);

-- Allow admins to view all enrollments
CREATE POLICY "Admins can view all enrollments" 
ON public.enrollments 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IN (
    SELECT users.auth_id 
    FROM users 
    WHERE users.role = 'ADMIN'
  )
);

-- Allow admins to view all access codes
CREATE POLICY "Admins can view all access codes" 
ON public.access_codes 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IN (
    SELECT users.auth_id 
    FROM users 
    WHERE users.role = 'ADMIN'
  )
);
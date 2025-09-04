-- Drop existing policies for support attachments
DROP POLICY IF EXISTS "Users can upload their own support attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own support attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all support attachments" ON storage.objects;

-- Create corrected policies for support attachment uploads
CREATE POLICY "Users can upload support attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'support-attachments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view support attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'support-attachments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can manage all support attachments" 
ON storage.objects 
FOR ALL
USING (
  bucket_id = 'support-attachments' 
  AND auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'ADMIN'::user_role
  )
);
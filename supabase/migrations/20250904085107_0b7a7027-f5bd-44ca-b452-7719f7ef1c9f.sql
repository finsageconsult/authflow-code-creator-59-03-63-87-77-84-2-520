-- Add attachment_url column to support_queries table
ALTER TABLE public.support_queries 
ADD COLUMN attachment_url TEXT;

-- Create storage bucket for support attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('support-attachments', 'support-attachments', false);

-- Create policies for support attachment uploads
CREATE POLICY "Users can upload their own support attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own support attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all support attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'support-attachments' AND auth.uid() IN (
  SELECT auth_id FROM users WHERE role = 'ADMIN'::user_role
));
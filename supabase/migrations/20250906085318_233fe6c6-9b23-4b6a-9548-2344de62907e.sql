-- Update storage policies to allow folder names using either auth.uid() or the mapped public.users.id

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chat files" ON storage.objects;

-- Recreate policies with broader condition
CREATE POLICY "Users can upload their own chat files"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-files' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);

CREATE POLICY "Users can view their own chat files"
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-files' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);

CREATE POLICY "Users can delete their own chat files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-files' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);

CREATE POLICY "Users can update their own chat files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat-files' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);
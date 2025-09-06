-- Create storage policies for assignments bucket (if it doesn't exist, create it)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignments', 'assignments', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist for assignments bucket
DROP POLICY IF EXISTS "Users can upload assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update assignment files" ON storage.objects;

-- Create storage policies for assignment files
CREATE POLICY "Users can upload assignment files"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'assignments' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);

CREATE POLICY "Users can view assignment files"
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'assignments' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);

CREATE POLICY "Users can delete assignment files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'assignments' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);

CREATE POLICY "Users can update assignment files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'assignments' AND 
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = public.get_current_user_id()::text
  )
);
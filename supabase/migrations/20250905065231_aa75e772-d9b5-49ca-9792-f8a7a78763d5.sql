-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  assigned_to UUID NOT NULL,
  organization_id UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assignment_type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment messages table for chat
CREATE TABLE public.assignment_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment files table for file sharing
CREATE TABLE public.assignment_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY "Users can view assignments they created or are assigned to"
ON public.assignments
FOR SELECT
USING (
  created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
  OR assigned_to IN (SELECT id FROM users WHERE auth_id = auth.uid())
  OR (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid() AND role IN ('HR', 'ADMIN')))
);

CREATE POLICY "Users can create assignments"
ON public.assignments
FOR INSERT
WITH CHECK (
  created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

CREATE POLICY "Users can update their assignments"
ON public.assignments
FOR UPDATE
USING (
  created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
  OR assigned_to IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their assignments"
ON public.assignment_messages
FOR SELECT
USING (
  assignment_id IN (
    SELECT id FROM assignments WHERE 
    created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR assigned_to IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

CREATE POLICY "Users can create messages in their assignments"
ON public.assignment_messages
FOR INSERT
WITH CHECK (
  sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  AND assignment_id IN (
    SELECT id FROM assignments WHERE 
    created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR assigned_to IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

-- RLS Policies for files
CREATE POLICY "Users can view files in their assignments"
ON public.assignment_files
FOR SELECT
USING (
  assignment_id IN (
    SELECT id FROM assignments WHERE 
    created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR assigned_to IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

CREATE POLICY "Users can upload files to their assignments"
ON public.assignment_files
FOR INSERT
WITH CHECK (
  uploaded_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
  AND assignment_id IN (
    SELECT id FROM assignments WHERE 
    created_by IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR assigned_to IN (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

-- Create storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public) VALUES ('assignments', 'assignments', false);

-- Storage policies
CREATE POLICY "Users can view assignment files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'assignments'
  AND name LIKE '%'
);

CREATE POLICY "Users can upload assignment files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'assignments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update timestamps
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assignment_files;
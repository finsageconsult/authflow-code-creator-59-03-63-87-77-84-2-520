-- Create content_library table
CREATE TABLE public.content_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  duration TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  type TEXT CHECK (type IN ('blog', 'video', 'pdf', 'link')) NOT NULL,
  content_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all content" 
ON public.content_library 
FOR ALL 
USING (auth.uid() IN (
  SELECT users.auth_id 
  FROM users 
  WHERE users.role = 'ADMIN'
));

CREATE POLICY "Everyone can view content" 
ON public.content_library 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_content_library_updated_at
  BEFORE UPDATE ON public.content_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
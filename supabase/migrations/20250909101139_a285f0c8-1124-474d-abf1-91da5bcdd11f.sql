-- Create blog_library table
CREATE TABLE public.blog_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  duration TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  paragraphs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.blog_library ENABLE ROW LEVEL SECURITY;

-- Create policies for blog management
CREATE POLICY "Admins can manage all blogs" 
ON public.blog_library 
FOR ALL 
USING (auth.uid() IN ( 
  SELECT users.auth_id
  FROM users
  WHERE users.role = 'ADMIN'::user_role
));

CREATE POLICY "Everyone can view blogs" 
ON public.blog_library 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_library_updated_at
BEFORE UPDATE ON public.blog_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
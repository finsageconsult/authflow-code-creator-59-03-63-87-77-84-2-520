-- Create webinars table
CREATE TABLE public.webinars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_participants INTEGER NOT NULL DEFAULT 100,
  current_participants INTEGER NOT NULL DEFAULT 0,
  credits_required INTEGER NOT NULL DEFAULT 2,
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  meeting_link TEXT,
  recording_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  tags TEXT[] DEFAULT '{}',
  organization_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;

-- Create policies for webinars
CREATE POLICY "Admins can manage all webinars" 
ON public.webinars 
FOR ALL 
USING (auth.uid() IN (
  SELECT users.auth_id 
  FROM users 
  WHERE users.role = 'ADMIN'
));

CREATE POLICY "HR can view webinars for their org" 
ON public.webinars 
FOR SELECT 
USING (organization_id IN (
  SELECT users.organization_id 
  FROM users 
  WHERE users.auth_id = auth.uid() 
  AND users.role = ANY(ARRAY['HR', 'ADMIN'])
));

CREATE POLICY "Employees can view webinars for their org" 
ON public.webinars 
FOR SELECT 
USING (organization_id IN (
  SELECT users.organization_id 
  FROM users 
  WHERE users.auth_id = auth.uid() 
  AND users.role = 'EMPLOYEE'
));

-- Create trigger for updated_at
CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON public.webinars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
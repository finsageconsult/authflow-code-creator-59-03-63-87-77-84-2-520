-- Create support_queries table
CREATE TABLE public.support_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_queries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own queries"
ON public.support_queries
FOR SELECT
USING (user_id IN (
  SELECT users.id FROM users WHERE users.auth_id = auth.uid()
));

CREATE POLICY "Users can create their own queries"
ON public.support_queries
FOR INSERT
WITH CHECK (user_id IN (
  SELECT users.id FROM users WHERE users.auth_id = auth.uid()
));

CREATE POLICY "Admins can manage all queries"
ON public.support_queries
FOR ALL
USING (get_current_user_role() = 'ADMIN'::user_role);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_queries_updated_at
BEFORE UPDATE ON public.support_queries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for support_queries table
ALTER TABLE public.support_queries REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_queries;
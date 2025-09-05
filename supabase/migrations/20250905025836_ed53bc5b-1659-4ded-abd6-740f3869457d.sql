-- Add category, price, and free_limit fields to financial_tools table
ALTER TABLE public.financial_tools 
ADD COLUMN category text DEFAULT 'free' CHECK (category IN ('free', 'paid')),
ADD COLUMN free_limit integer DEFAULT 5;

-- Update existing tools to have default values
UPDATE public.financial_tools 
SET category = CASE 
  WHEN access_level = 'premium' THEN 'paid'
  ELSE 'free'
END;

-- Create tool_usage table to track employee usage
CREATE TABLE public.tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.financial_tools(id) ON DELETE CASCADE,
  used_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS on tool_usage
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for tool_usage
CREATE POLICY "Users can view their own tool usage" 
ON public.tool_usage 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert their own tool usage" 
ON public.tool_usage 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own tool usage" 
ON public.tool_usage 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Admins can manage all tool usage" 
ON public.tool_usage 
FOR ALL 
USING (get_current_user_role() = 'ADMIN'::user_role);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_tool_usage_updated_at
  BEFORE UPDATE ON public.tool_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
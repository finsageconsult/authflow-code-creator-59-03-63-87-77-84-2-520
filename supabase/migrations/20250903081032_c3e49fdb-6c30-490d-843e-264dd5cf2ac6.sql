-- Add org plan table for credit management
CREATE TABLE IF NOT EXISTS public.org_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('STARTER', 'GROWTH', 'ENTERPRISE')),
  credit_allotment_1on1 INTEGER NOT NULL DEFAULT 0,
  credit_allotment_webinar INTEGER NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.org_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for org_plans
CREATE POLICY "Admins can manage all org plans" 
ON public.org_plans 
FOR ALL 
USING (auth.uid() IN (
  SELECT u.auth_id FROM users u WHERE u.role = 'ADMIN'::user_role
));

CREATE POLICY "Users can view their org plan" 
ON public.org_plans 
FOR SELECT 
USING (organization_id IN (
  SELECT u.organization_id FROM users u WHERE u.auth_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_org_plans_updated_at
BEFORE UPDATE ON public.org_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default plans for existing organizations
INSERT INTO public.org_plans (organization_id, plan_type, credit_allotment_1on1, credit_allotment_webinar)
SELECT 
  id,
  CASE 
    WHEN plan = 'FREE' THEN 'STARTER'
    WHEN plan = 'BASIC' THEN 'GROWTH'
    WHEN plan = 'PREMIUM' THEN 'ENTERPRISE'
    ELSE 'STARTER'
  END,
  CASE 
    WHEN plan = 'FREE' THEN 5
    WHEN plan = 'BASIC' THEN 20
    WHEN plan = 'PREMIUM' THEN 50
    ELSE 5
  END,
  CASE 
    WHEN plan = 'FREE' THEN 2
    WHEN plan = 'BASIC' THEN 10
    WHEN plan = 'PREMIUM' THEN 25
    ELSE 2
  END
FROM public.organizations
WHERE id NOT IN (SELECT organization_id FROM public.org_plans);
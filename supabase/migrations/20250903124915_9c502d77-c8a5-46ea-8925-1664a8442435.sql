-- Create coach availability table
CREATE TABLE public.coach_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  buffer_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;

-- Create coach availability policies
CREATE POLICY "Coaches can manage their own availability" 
ON public.coach_availability 
FOR ALL 
USING (coach_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'COACH'));

-- Create coaching sessions table
CREATE TABLE public.coaching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  client_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  session_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  meeting_link TEXT,
  notes TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  outcome_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Create coaching sessions policies
CREATE POLICY "Coaches can manage their own sessions" 
ON public.coaching_sessions 
FOR ALL 
USING (coach_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'COACH'));

CREATE POLICY "Clients can view their own sessions" 
ON public.coaching_sessions 
FOR SELECT 
USING (client_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "HR can view org sessions" 
ON public.coaching_sessions 
FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid() AND role IN ('HR', 'ADMIN')));

-- Create coach payouts table (read-only for now)
CREATE TABLE public.coach_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0, -- in paisa
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_payouts ENABLE ROW LEVEL SECURITY;

-- Create coach payouts policies
CREATE POLICY "Coaches can view their own payouts" 
ON public.coach_payouts 
FOR SELECT 
USING (coach_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'COACH'));

CREATE POLICY "Admins can manage all payouts" 
ON public.coach_payouts 
FOR ALL 
USING (auth.uid() IN (SELECT auth_id FROM users WHERE role = 'ADMIN'));

-- Create outcome tags enum for better recommendations
CREATE TYPE public.outcome_tag AS ENUM (
  'TAX_CLARITY',
  'DEBT_PLAN', 
  'SALARY_STRUCT',
  'EMERGENCY_FUND',
  'INVESTMENT_START',
  'BUDGET_CREATE',
  'CREDIT_IMPROVE',
  'RETIREMENT_PLAN',
  'INSURANCE_REVIEW',
  'EXPENSE_REDUCE',
  'INCOME_INCREASE',
  'FINANCIAL_GOAL_SET',
  'RISK_ASSESSMENT',
  'PORTFOLIO_REVIEW'
);

-- Create triggers for updated_at
CREATE TRIGGER update_coach_availability_updated_at
BEFORE UPDATE ON public.coach_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_sessions_updated_at
BEFORE UPDATE ON public.coaching_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_payouts_updated_at
BEFORE UPDATE ON public.coach_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
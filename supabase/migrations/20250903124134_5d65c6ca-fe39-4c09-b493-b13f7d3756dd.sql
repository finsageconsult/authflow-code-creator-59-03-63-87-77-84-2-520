-- Create webinars/program calendar table
CREATE TABLE public.webinars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT,
  instructor_bio TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 100,
  current_participants INTEGER DEFAULT 0,
  credits_required INTEGER DEFAULT 2,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  meeting_link TEXT,
  recording_link TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create tickets/referrals table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  coach_id UUID,
  hr_id UUID NOT NULL,
  ticket_type TEXT DEFAULT 'referral' CHECK (ticket_type IN ('referral', 'escalation', 'request')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'debt_management', 'investment_planning', etc.
  anonymized_concerns TEXT[], -- no PII, just concern categories
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create anonymized insights table for aggregated data
CREATE TABLE public.anonymized_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  insight_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_employees INTEGER DEFAULT 0,
  active_participants INTEGER DEFAULT 0,
  
  -- Mood/sentiment aggregates (no individual data)
  avg_stress_level DECIMAL(3,2),
  avg_confidence_level DECIMAL(3,2),
  mood_distribution JSONB, -- {"excited": 20, "optimistic": 45, "neutral": 25, "worried": 8, "stressed": 2}
  
  -- Topic preferences (aggregated)
  top_concerns JSONB, -- {"Tax Planning": 45, "Investment": 38, "Debt Management": 32}
  
  -- Engagement metrics
  webinar_attendance_rate DECIMAL(5,2),
  one_on_one_booking_rate DECIMAL(5,2),
  tool_usage_rate DECIMAL(5,2),
  
  -- Program effectiveness
  completion_rates JSONB, -- {"webinars": 78, "coaching": 92, "tools": 65}
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per org per day
  UNIQUE(organization_id, insight_date)
);

-- Create program communications table
CREATE TABLE public.program_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  webinar_id UUID REFERENCES public.webinars(id),
  communication_type TEXT NOT NULL CHECK (communication_type IN ('reminder', 'nudge', 'announcement', 'follow_up')),
  subject TEXT NOT NULL,
  message_body TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymized_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webinars
CREATE POLICY "HR can manage webinars in their org" ON public.webinars
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM users 
    WHERE auth_id = auth.uid() AND role IN ('HR', 'ADMIN')
  )
);

CREATE POLICY "Employees can view webinars in their org" ON public.webinars
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM users 
    WHERE auth_id = auth.uid()
  )
);

-- RLS Policies for tickets
CREATE POLICY "HR can manage tickets in their org" ON public.tickets
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM users 
    WHERE auth_id = auth.uid() AND role IN ('HR', 'ADMIN')
  )
);

CREATE POLICY "Coaches can view assigned tickets" ON public.tickets
FOR SELECT USING (
  coach_id IN (
    SELECT id FROM users 
    WHERE auth_id = auth.uid() AND role = 'COACH'
  )
);

-- RLS Policies for anonymized insights
CREATE POLICY "HR can view insights for their org" ON public.anonymized_insights
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM users 
    WHERE auth_id = auth.uid() AND role IN ('HR', 'ADMIN')
  )
);

CREATE POLICY "Admins can manage all insights" ON public.anonymized_insights
FOR ALL USING (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'ADMIN'
  )
);

-- RLS Policies for program communications
CREATE POLICY "HR can manage communications in their org" ON public.program_communications
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM users 
    WHERE auth_id = auth.uid() AND role IN ('HR', 'ADMIN')
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON public.webinars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
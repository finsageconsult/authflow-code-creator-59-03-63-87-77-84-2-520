-- Create individual programs table
CREATE TABLE public.individual_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'course', -- 'course' or 'coaching'
  level TEXT NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
  duration TEXT NOT NULL,
  price INTEGER NOT NULL, -- price in paisa
  rating NUMERIC DEFAULT 4.5,
  students INTEGER DEFAULT 0,
  content_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.individual_programs ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing programs (everyone can view active programs)
CREATE POLICY "Anyone can view active programs" 
ON public.individual_programs 
FOR SELECT 
USING (is_active = true);

-- Create policy for admins to manage programs
CREATE POLICY "Admins can manage programs" 
ON public.individual_programs 
FOR ALL 
USING (get_current_user_role() = 'ADMIN'::user_role);

-- Create individual purchases table
CREATE TABLE public.individual_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.individual_programs(id),
  order_id UUID REFERENCES public.orders(id),
  amount_paid INTEGER NOT NULL, -- amount in paisa
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  access_granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0, -- percentage 0-100
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.individual_purchases ENABLE ROW LEVEL_SECURITY;

-- Create policies for individual purchases
CREATE POLICY "Users can view their own purchases" 
ON public.individual_purchases 
FOR SELECT 
USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create their own purchases" 
ON public.individual_purchases 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Admins can manage all purchases" 
ON public.individual_purchases 
FOR ALL 
USING (get_current_user_role() = 'ADMIN'::user_role);

-- Create individual bookings table for coaching sessions
CREATE TABLE public.individual_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.individual_programs(id),
  purchase_id UUID NOT NULL REFERENCES public.individual_purchases(id),
  coach_id UUID REFERENCES public.users(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  notes TEXT,
  rating INTEGER, -- 1-5 stars
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.individual_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for individual bookings
CREATE POLICY "Users can manage their own bookings" 
ON public.individual_bookings 
FOR ALL 
USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Coaches can view their assigned bookings" 
ON public.individual_bookings 
FOR SELECT 
USING (coach_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND role = 'COACH'::user_role));

CREATE POLICY "Admins can manage all bookings" 
ON public.individual_bookings 
FOR ALL 
USING (get_current_user_role() = 'ADMIN'::user_role);

-- Create triggers for updated_at columns
CREATE TRIGGER update_individual_programs_updated_at
  BEFORE UPDATE ON public.individual_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_purchases_updated_at
  BEFORE UPDATE ON public.individual_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_bookings_updated_at
  BEFORE UPDATE ON public.individual_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample programs
INSERT INTO public.individual_programs (title, description, category, level, duration, price, rating, students, tags) VALUES
('Investing in 3 Hours', 'Complete beginner guide to smart investing - learn fundamentals, risk management, and portfolio building', 'course', 'Beginner', '3 hours', 299900, 4.8, 1234, '{"investing", "beginner", "portfolio", "stocks"}'),
('Salary → SIP Masterclass', 'Transform your salary into systematic investments with proven SIP strategies', 'course', 'Intermediate', '4 hours', 399900, 4.9, 892, '{"SIP", "salary", "systematic", "investment"}'),
('Tax Panic to Peace', 'Master tax planning and reduce anxiety with comprehensive tax optimization strategies', 'course', 'Beginner', '2.5 hours', 249900, 4.7, 567, '{"tax", "planning", "anxiety", "optimization"}'),
('Financial Blueprint Session', 'Personalized financial roadmap with expert coach - one-on-one session', 'coaching', 'Beginner', '90 min', 499900, 4.9, 234, '{"1on1", "financial", "roadmap", "personal"}'),
('Smart Tax Planning', '1:1 session for tax optimization strategies tailored to your situation', 'coaching', 'Intermediate', '60 min', 399900, 4.8, 156, '{"1on1", "tax", "optimization", "personal"}'),
('Debt-Free Journey', 'Personal debt elimination strategy session with actionable plan', 'coaching', 'Beginner', '75 min', 449900, 4.9, 89, '{"1on1", "debt", "elimination", "strategy"}')
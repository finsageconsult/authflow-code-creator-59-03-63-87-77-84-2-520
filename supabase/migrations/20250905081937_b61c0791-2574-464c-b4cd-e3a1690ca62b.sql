-- Create enrollments table for course enrollment workflow
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID NOT NULL,
  coach_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  slot_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'free' CHECK (payment_status IN ('free', 'paid', 'failed', 'skipped')),
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  scheduled_at TIMESTAMPTZ,
  amount_paid INTEGER DEFAULT 0,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create coach_time_slots table for available time slots
CREATE TABLE public.coach_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  slot_type TEXT DEFAULT 'coaching' CHECK (slot_type IN ('coaching', 'webinar', 'workshop')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_time_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enrollments
CREATE POLICY "Users can view their own enrollments"
ON public.enrollments
FOR SELECT
USING (user_id IN (
  SELECT u.id FROM public.users u WHERE u.auth_id = auth.uid()
));

CREATE POLICY "Users can create their own enrollments"
ON public.enrollments
FOR INSERT
WITH CHECK (user_id IN (
  SELECT u.id FROM public.users u WHERE u.auth_id = auth.uid()
));

CREATE POLICY "Users can update their own enrollments"
ON public.enrollments
FOR UPDATE
USING (user_id IN (
  SELECT u.id FROM public.users u WHERE u.auth_id = auth.uid()
));

CREATE POLICY "Coaches can view enrollments for their sessions"
ON public.enrollments
FOR SELECT
USING (coach_id IN (
  SELECT u.id FROM public.users u WHERE u.auth_id = auth.uid() AND u.role = 'COACH'
));

CREATE POLICY "Admins can manage all enrollments"
ON public.enrollments
FOR ALL
USING (get_current_user_role() = 'ADMIN');

-- RLS Policies for coach_time_slots
CREATE POLICY "Everyone can view available time slots"
ON public.coach_time_slots
FOR SELECT
USING (is_available = true);

CREATE POLICY "Coaches can manage their own time slots"
ON public.coach_time_slots
FOR ALL
USING (coach_id IN (
  SELECT u.id FROM public.users u WHERE u.auth_id = auth.uid() AND u.role = 'COACH'
));

CREATE POLICY "Admins can manage all time slots"
ON public.coach_time_slots
FOR ALL
USING (get_current_user_role() = 'ADMIN');

-- Add triggers for updated_at
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_time_slots_updated_at
  BEFORE UPDATE ON public.coach_time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
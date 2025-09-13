-- Create coach payout settings table
CREATE TABLE public.coach_payout_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payment_rate_per_student DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_currency TEXT NOT NULL DEFAULT 'INR',
  bank_details JSONB DEFAULT '{}',
  tax_details JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id)
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_number TEXT NOT NULL UNIQUE,
  coach_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_students INTEGER NOT NULL DEFAULT 0,
  payment_rate_per_student DECIMAL(10,2) NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payout line items table
CREATE TABLE public.payout_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.enrollments(id),
  purchase_id UUID REFERENCES public.individual_purchases(id),
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  course_title TEXT NOT NULL,
  enrollment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_payout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for coach_payout_settings
CREATE POLICY "Admins can manage all coach payout settings"
ON public.coach_payout_settings
FOR ALL
USING (auth.uid() IN (
  SELECT users.auth_id FROM users WHERE users.role = 'ADMIN'
));

CREATE POLICY "Coaches can view their own payout settings"
ON public.coach_payout_settings
FOR SELECT
USING (coach_id IN (
  SELECT users.id FROM users WHERE users.auth_id = auth.uid()
));

-- Create RLS policies for payouts
CREATE POLICY "Admins can manage all payouts"
ON public.payouts
FOR ALL
USING (auth.uid() IN (
  SELECT users.auth_id FROM users WHERE users.role = 'ADMIN'
));

CREATE POLICY "Coaches can view their own payouts"
ON public.payouts
FOR SELECT
USING (coach_id IN (
  SELECT users.id FROM users WHERE users.auth_id = auth.uid()
));

-- Create RLS policies for payout_line_items
CREATE POLICY "Admins can manage all payout line items"
ON public.payout_line_items
FOR ALL
USING (auth.uid() IN (
  SELECT users.auth_id FROM users WHERE users.role = 'ADMIN'
));

CREATE POLICY "Users can view payout line items for their payouts"
ON public.payout_line_items
FOR SELECT
USING (payout_id IN (
  SELECT payouts.id FROM payouts 
  JOIN users ON payouts.coach_id = users.id
  WHERE users.auth_id = auth.uid()
));

-- Create updated_at triggers
CREATE TRIGGER update_coach_payout_settings_updated_at
BEFORE UPDATE ON public.coach_payout_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate payout number
CREATE OR REPLACE FUNCTION public.generate_payout_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  prefix TEXT := 'PAYOUT';
  timestamp_part TEXT := to_char(NOW(), 'YYYYMM');
  sequence_part TEXT := lpad((SELECT COUNT(*) + 1 FROM payouts WHERE created_at >= date_trunc('month', NOW()))::TEXT, 4, '0');
BEGIN
  RETURN prefix || timestamp_part || sequence_part;
END;
$$;

-- Create function to calculate coach payouts
CREATE OR REPLACE FUNCTION public.calculate_coach_payout(
  p_coach_id UUID,
  p_period_start DATE,
  p_period_end DATE
) RETURNS TABLE (
  total_students INTEGER,
  gross_amount DECIMAL,
  enrollment_details JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_rate DECIMAL(10,2);
  v_total_students INTEGER := 0;
  v_gross_amount DECIMAL(10,2) := 0.00;
  v_enrollment_details JSONB := '[]'::jsonb;
BEGIN
  -- Get coach payment rate
  SELECT payment_rate_per_student INTO v_payment_rate
  FROM coach_payout_settings 
  WHERE coach_id = p_coach_id AND is_active = true;
  
  IF v_payment_rate IS NULL THEN
    v_payment_rate := 0.00;
  END IF;
  
  -- Calculate from enrollments and purchases
  WITH enrollment_data AS (
    SELECT 
      e.id as enrollment_id,
      u.name as student_name,
      u.email as student_email,
      COALESCE(ip.title, 'Financial Coaching Program') as course_title,
      e.enrollment_date::date as enrollment_date,
      v_payment_rate as amount
    FROM enrollments e
    JOIN users u ON e.user_id = u.id
    LEFT JOIN individual_programs ip ON e.course_id = ip.id
    WHERE e.coach_id = p_coach_id 
      AND e.status IN ('confirmed', 'completed', 'active')
      AND e.enrollment_date::date BETWEEN p_period_start AND p_period_end
  ),
  purchase_data AS (
    SELECT 
      pur.id as purchase_id,
      u.name as student_name,
      u.email as student_email,
      ip.title as course_title,
      pur.created_at::date as enrollment_date,
      v_payment_rate as amount
    FROM individual_purchases pur
    JOIN users u ON pur.user_id = u.id
    JOIN individual_programs ip ON pur.program_id = ip.id
    WHERE pur.status = 'completed'
      AND pur.created_at::date BETWEEN p_period_start AND p_period_end
      AND ip.category = '1-1-sessions'
  ),
  combined_data AS (
    SELECT enrollment_id, null::uuid as purchase_id, student_name, student_email, course_title, enrollment_date, amount FROM enrollment_data
    UNION ALL
    SELECT null::uuid as enrollment_id, purchase_id, student_name, student_email, course_title, enrollment_date, amount FROM purchase_data
  )
  SELECT 
    COUNT(*)::INTEGER,
    (COUNT(*) * v_payment_rate)::DECIMAL(10,2),
    CASE 
      WHEN COUNT(*) > 0 THEN
        jsonb_agg(
          jsonb_build_object(
            'enrollment_id', enrollment_id,
            'purchase_id', purchase_id,
            'student_name', student_name,
            'student_email', student_email,
            'course_title', course_title,
            'enrollment_date', enrollment_date,
            'amount', amount
          )
        )
      ELSE '[]'::jsonb
    END
  INTO v_total_students, v_gross_amount, v_enrollment_details
  FROM combined_data;
  
  RETURN QUERY SELECT v_total_students, v_gross_amount, v_enrollment_details;
END;
$$;
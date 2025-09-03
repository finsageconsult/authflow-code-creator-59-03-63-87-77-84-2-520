-- Create scheduled_reports table for managing automated report deliveries
CREATE TABLE public.scheduled_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,
    user_id UUID,
    report_type TEXT NOT NULL CHECK (report_type IN ('org', 'coach', 'employee')),
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
    email TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage scheduled reports for their org"
ON public.scheduled_reports
FOR ALL
USING (
    organization_id IN (
        SELECT u.organization_id 
        FROM users u 
        WHERE u.auth_id = auth.uid() 
        AND u.role IN ('HR', 'ADMIN')
    )
);

CREATE POLICY "Users can manage their own scheduled reports"
ON public.scheduled_reports
FOR ALL
USING (
    user_id IN (
        SELECT u.id 
        FROM users u 
        WHERE u.auth_id = auth.uid()
    )
);

-- Create function to update next_run_at based on frequency
CREATE OR REPLACE FUNCTION public.calculate_next_run_at(freq TEXT, last_sent TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
BEGIN
    IF last_sent IS NULL THEN
        last_sent := now();
    END IF;
    
    CASE freq
        WHEN 'weekly' THEN
            RETURN last_sent + INTERVAL '7 days';
        WHEN 'monthly' THEN
            RETURN last_sent + INTERVAL '1 month';
        ELSE
            RETURN last_sent + INTERVAL '1 week';
    END CASE;
END;
$$;

-- Create trigger to automatically update next_run_at
CREATE OR REPLACE FUNCTION public.update_next_run_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.next_run_at := calculate_next_run_at(NEW.frequency, NEW.last_sent_at);
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_scheduled_reports_next_run
    BEFORE INSERT OR UPDATE ON public.scheduled_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_next_run_at();
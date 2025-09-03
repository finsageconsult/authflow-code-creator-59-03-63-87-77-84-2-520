-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.calculate_next_run_at(freq TEXT, last_sent TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix the trigger function as well
CREATE OR REPLACE FUNCTION public.update_next_run_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.next_run_at := calculate_next_run_at(NEW.frequency, NEW.last_sent_at);
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;
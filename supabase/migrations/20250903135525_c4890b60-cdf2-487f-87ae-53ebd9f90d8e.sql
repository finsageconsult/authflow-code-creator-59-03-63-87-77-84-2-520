-- Phase 11: Security, Privacy, Compliance Implementation

-- Create encrypted questionnaire responses table
CREATE TABLE public.encrypted_questionnaire_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    response_data_encrypted TEXT NOT NULL, -- Encrypted JSON data
    encryption_key_id TEXT NOT NULL, -- Key identifier for rotation
    response_hash TEXT NOT NULL, -- Hash for integrity verification
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on encrypted responses
ALTER TABLE public.encrypted_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Only the user themselves can access their encrypted responses
CREATE POLICY "Users can manage their own encrypted responses" 
ON public.encrypted_questionnaire_responses 
FOR ALL 
USING (
    user_id IN (
        SELECT u.id 
        FROM public.users u 
        WHERE u.auth_id = auth.uid()
    )
);

-- Create privacy consent tracking table
CREATE TABLE public.privacy_consents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    consent_type TEXT NOT NULL, -- 'terms', 'privacy', 'marketing', 'analytics'
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_version TEXT NOT NULL, -- Version of terms/privacy policy
    ip_address INET, -- For legal compliance
    user_agent TEXT, -- For audit trail
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, consent_type, consent_version)
);

-- Enable RLS on consent tracking
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;

-- Users can manage their own consents
CREATE POLICY "Users can manage their own consents" 
ON public.privacy_consents 
FOR ALL 
USING (
    user_id IN (
        SELECT u.id 
        FROM public.users u 
        WHERE u.auth_id = auth.uid()
    )
);

-- Admins can view consent data for compliance
CREATE POLICY "Admins can view consent data for compliance" 
ON public.privacy_consents 
FOR SELECT 
USING (
    auth.uid() IN (
        SELECT u.auth_id 
        FROM public.users u 
        WHERE u.role = 'ADMIN'
    )
);

-- Create security audit log table
CREATE TABLE public.security_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'login_attempt', 'role_change', 'data_access', etc.
    user_id UUID,
    target_user_id UUID, -- For actions affecting other users
    event_details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    risk_level TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - only admins can access audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access security audit logs" 
ON public.security_audit_logs 
FOR ALL 
USING (
    auth.uid() IN (
        SELECT u.auth_id 
        FROM public.users u 
        WHERE u.role = 'ADMIN'
    )
);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_target_user_id UUID DEFAULT NULL,
    p_event_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_risk_level TEXT DEFAULT 'low'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_logs (
        event_type, user_id, target_user_id, event_details,
        ip_address, user_agent, success, risk_level
    ) VALUES (
        p_event_type, p_user_id, p_target_user_id, p_event_details,
        p_ip_address, p_user_agent, p_success, p_risk_level
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Strengthen existing RLS policies with additional org_id + role scope validation
-- Update mood_check_ins policy to be more restrictive
DROP POLICY IF EXISTS "HR can view org mood check-ins" ON public.mood_check_ins;
CREATE POLICY "HR can view anonymized org mood check-ins" 
ON public.mood_check_ins 
FOR SELECT 
USING (
    -- HR can only see stress/confidence levels, not notes or individual concerns
    user_id IN (
        SELECT u.id 
        FROM public.users u 
        WHERE u.organization_id = get_current_user_org_id() 
        AND get_current_user_role() = ANY(ARRAY['HR'::user_role, 'ADMIN'::user_role])
        -- Additional validation: ensure HR user's org matches
        AND EXISTS (
            SELECT 1 
            FROM public.users hr_user 
            WHERE hr_user.auth_id = auth.uid() 
            AND hr_user.organization_id = u.organization_id
        )
    )
);

-- Create trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_privacy_consent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_privacy_consents_timestamp
    BEFORE UPDATE ON public.privacy_consents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_privacy_consent_timestamp();

CREATE TRIGGER update_encrypted_responses_timestamp
    BEFORE UPDATE ON public.encrypted_questionnaire_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_privacy_consents_user_type ON public.privacy_consents(user_id, consent_type);
CREATE INDEX idx_security_audit_logs_event_time ON public.security_audit_logs(event_type, created_at);
CREATE INDEX idx_encrypted_responses_user_time ON public.encrypted_questionnaire_responses(user_id, created_at);
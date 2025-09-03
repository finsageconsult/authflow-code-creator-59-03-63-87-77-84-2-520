-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL');

-- Create enum for organization plans
CREATE TYPE public.organization_plan AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- Create enum for organization status
CREATE TYPE public.organization_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- Organizations table
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    plan organization_plan NOT NULL DEFAULT 'FREE',
    status organization_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Users table (extends auth.users with additional fields)
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'INDIVIDUAL',
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    status user_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Membership table for organization-user relationships
CREATE TABLE public.memberships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, organization_id)
);

-- Access codes for organization invites
CREATE TABLE public.access_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit log for tracking changes
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their organization" 
ON public.organizations 
FOR SELECT 
USING (
    auth.uid() IN (
        SELECT u.auth_id 
        FROM public.users u 
        WHERE u.organization_id = organizations.id
    )
);

CREATE POLICY "Admins can manage organizations" 
ON public.organizations 
FOR ALL 
USING (
    auth.uid() IN (
        SELECT u.auth_id 
        FROM public.users u 
        WHERE u.role = 'ADMIN'
    )
);

-- RLS Policies for Users
CREATE POLICY "Users can view users in their organization" 
ON public.users 
FOR SELECT 
USING (
    auth.uid() = auth_id OR
    organization_id IN (
        SELECT u.organization_id 
        FROM public.users u 
        WHERE u.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_id);

CREATE POLICY "HR and Admins can manage users in their org" 
ON public.users 
FOR ALL 
USING (
    auth.uid() IN (
        SELECT u.auth_id 
        FROM public.users u 
        WHERE u.role IN ('ADMIN', 'HR') 
        AND u.organization_id = users.organization_id
    )
);

-- RLS Policies for Memberships
CREATE POLICY "Users can view memberships in their organization" 
ON public.memberships 
FOR SELECT 
USING (
    organization_id IN (
        SELECT u.organization_id 
        FROM public.users u 
        WHERE u.auth_id = auth.uid()
    )
);

CREATE POLICY "HR and Admins can manage memberships" 
ON public.memberships 
FOR ALL 
USING (
    auth.uid() IN (
        SELECT u.auth_id 
        FROM public.users u 
        WHERE u.role IN ('ADMIN', 'HR') 
        AND u.organization_id = memberships.organization_id
    )
);

-- RLS Policies for Access Codes
CREATE POLICY "HR and Admins can manage access codes" 
ON public.access_codes 
FOR ALL 
USING (
    auth.uid() IN (
        SELECT u.auth_id 
        FROM public.users u 
        WHERE u.role IN ('ADMIN', 'HR') 
        AND u.organization_id = access_codes.organization_id
    )
);

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view audit logs for their organization" 
ON public.audit_logs 
FOR SELECT 
USING (
    organization_id IN (
        SELECT u.organization_id 
        FROM public.users u 
        WHERE u.auth_id = auth.uid()
    )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updating timestamps
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_access_codes_updated_at
    BEFORE UPDATE ON public.access_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Seed data: Create a sample organization and admin user
INSERT INTO public.organizations (name, plan, status) 
VALUES ('Finsage Demo', 'PREMIUM', 'ACTIVE');

-- Create indexes for better performance
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_organization_id ON public.users(organization_id);
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON public.memberships(organization_id);
CREATE INDEX idx_access_codes_code ON public.access_codes(code);
CREATE INDEX idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
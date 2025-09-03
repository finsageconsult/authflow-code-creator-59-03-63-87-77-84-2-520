-- Create content assets table for attachments
CREATE TABLE public.content_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'slide', 'recording', 'worksheet', 'document'
    mime_type TEXT,
    file_size INTEGER,
    content_id UUID, -- links to individual_programs, webinars, etc
    content_type TEXT, -- 'program', 'webinar', 'tool'
    uploaded_by UUID REFERENCES public.users(id),
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tags table for systematic tagging
CREATE TABLE public.content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'theme', 'skill_level', 'duration', 'financial_goal'
    description TEXT,
    color TEXT DEFAULT '#6B7280', -- hex color for UI
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content tag relationships
CREATE TABLE public.content_tag_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL, -- 'program', 'webinar', 'tool'
    tag_id UUID REFERENCES public.content_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(content_id, content_type, tag_id)
);

-- Create coaching offerings table
CREATE TABLE public.coaching_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    credits_needed INTEGER NOT NULL DEFAULT 1,
    price INTEGER, -- in paise for individual users
    coach_id UUID REFERENCES public.users(id),
    category TEXT NOT NULL DEFAULT 'general',
    max_participants INTEGER DEFAULT 1, -- 1 for 1-on-1, more for group
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tools table for calculators
CREATE TABLE public.financial_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    tool_type TEXT NOT NULL, -- 'calculator', 'planner', 'tracker'
    tool_config JSONB DEFAULT '{}', -- configuration for the tool
    ui_component TEXT, -- component name to render
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    access_level TEXT DEFAULT 'free', -- 'free', 'premium', 'coaching'
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_tools ENABLE ROW LEVEL SECURITY;

-- Content assets policies
CREATE POLICY "Anyone can view public content assets" ON public.content_assets
    FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all content assets" ON public.content_assets
    FOR ALL USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Coaches can manage their content assets" ON public.content_assets
    FOR ALL USING (uploaded_by IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'COACH'
    ));

-- Content tags policies
CREATE POLICY "Anyone can view content tags" ON public.content_tags
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage content tags" ON public.content_tags
    FOR ALL USING (get_current_user_role() = 'ADMIN');

-- Content tag relations policies
CREATE POLICY "Anyone can view tag relations" ON public.content_tag_relations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tag relations" ON public.content_tag_relations
    FOR ALL USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Coaches can manage tag relations for their content" ON public.content_tag_relations
    FOR ALL USING (
        (content_type = 'program' AND content_id IN (
            SELECT id FROM public.individual_programs WHERE id = content_id
        )) OR
        (content_type = 'offering' AND content_id IN (
            SELECT id FROM public.coaching_offerings WHERE coach_id IN (
                SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'COACH'
            )
        ))
    );

-- Coaching offerings policies
CREATE POLICY "Anyone can view active coaching offerings" ON public.coaching_offerings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can manage their offerings" ON public.coaching_offerings
    FOR ALL USING (coach_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'COACH'
    ));

CREATE POLICY "Admins can manage all coaching offerings" ON public.coaching_offerings
    FOR ALL USING (get_current_user_role() = 'ADMIN');

-- Financial tools policies
CREATE POLICY "Anyone can view active tools" ON public.financial_tools
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all tools" ON public.financial_tools
    FOR ALL USING (get_current_user_role() = 'ADMIN');

-- Add triggers for updated_at
CREATE TRIGGER update_content_assets_updated_at
    BEFORE UPDATE ON public.content_assets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaching_offerings_updated_at
    BEFORE UPDATE ON public.coaching_offerings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_tools_updated_at
    BEFORE UPDATE ON public.financial_tools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial content tags
INSERT INTO public.content_tags (name, category, description, color) VALUES
-- Theme-based tags
('Investing', 'theme', 'Investment and portfolio management', '#10B981'),
('Tax Planning', 'theme', 'Tax optimization strategies', '#F59E0B'),
('Budgeting', 'theme', 'Personal budgeting and expense management', '#3B82F6'),
('Debt Management', 'theme', 'Debt reduction and management', '#EF4444'),
('Retirement Planning', 'theme', 'Long-term retirement strategies', '#8B5CF6'),
('Emergency Fund', 'theme', 'Building emergency savings', '#06B6D4'),
('Insurance', 'theme', 'Insurance planning and protection', '#84CC16'),

-- Skill level tags
('Beginner', 'skill_level', 'Basic financial concepts', '#6B7280'),
('Intermediate', 'skill_level', 'Moderate financial knowledge required', '#F97316'),
('Advanced', 'skill_level', 'Advanced financial planning', '#DC2626'),

-- Duration tags
('Quick (< 30 min)', 'duration', 'Short duration content', '#22C55E'),
('Medium (30-60 min)', 'duration', 'Medium duration content', '#3B82F6'),
('Long (> 60 min)', 'duration', 'Extended duration content', '#8B5CF6'),

-- Financial goal tags
('Wealth Building', 'financial_goal', 'Building long-term wealth', '#10B981'),
('Debt Freedom', 'financial_goal', 'Achieving debt-free status', '#EF4444'),
('Financial Security', 'financial_goal', 'Building financial safety net', '#06B6D4'),
('Income Growth', 'financial_goal', 'Increasing income streams', '#F59E0B');

-- Insert sample coaching offerings
INSERT INTO public.coaching_offerings (title, description, duration_minutes, credits_needed, price, category, tags) VALUES
('Financial Health Checkup', 'Comprehensive review of your financial situation with personalized recommendations', 90, 2, 599900, 'assessment', ARRAY['assessment', 'personalized', 'comprehensive']),
('Investment Strategy Session', 'Deep dive into investment planning tailored to your goals and risk tolerance', 60, 1, 499900, 'investing', ARRAY['investing', 'strategy', 'personalized']),
('Debt Elimination Plan', 'Create a structured plan to eliminate debt efficiently', 75, 2, 549900, 'debt', ARRAY['debt', 'planning', 'elimination']),
('Tax Optimization Consultation', 'Maximize tax savings with expert guidance', 60, 1, 399900, 'tax', ARRAY['tax', 'optimization', 'savings']),
('Retirement Roadmap', 'Create a clear path to retirement with milestone planning', 90, 2, 649900, 'retirement', ARRAY['retirement', 'planning', 'long-term']);

-- Insert sample financial tools
INSERT INTO public.financial_tools (name, description, tool_type, ui_component, tool_config, access_level, tags) VALUES
('EMI Calculator', 'Calculate loan EMIs for various loan amounts and tenures', 'calculator', 'EMICalculator', '{"supports": ["home_loan", "personal_loan", "car_loan"]}', 'free', ARRAY['emi', 'loan', 'calculator']),
('SIP Calculator', 'Calculate returns from Systematic Investment Plans', 'calculator', 'SIPCalculator', '{"default_years": 10, "default_rate": 12}', 'free', ARRAY['sip', 'investing', 'calculator']),
('Tax Calculator', 'Calculate income tax based on current tax slabs', 'calculator', 'TaxCalculator', '{"tax_year": "2024-25"}', 'premium', ARRAY['tax', 'calculator', 'planning']),
('Budget Planner', 'Plan and track your monthly budget', 'planner', 'BudgetPlanner', '{"categories": ["income", "expenses", "savings"]}', 'free', ARRAY['budget', 'planning', 'tracking']),
('Portfolio Tracker', 'Track your investment portfolio performance', 'tracker', 'PortfolioTracker', '{"supports": ["stocks", "mutual_funds", "bonds"]}', 'premium', ARRAY['portfolio', 'investing', 'tracking']),
('Retirement Calculator', 'Plan for your retirement needs', 'calculator', 'RetirementCalculator', '{"inflation_rate": 6, "expected_return": 10}', 'premium', ARRAY['retirement', 'planning', 'calculator']);
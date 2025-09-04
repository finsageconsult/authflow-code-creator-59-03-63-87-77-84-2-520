-- Add pricing fields to financial_tools table
ALTER TABLE public.financial_tools 
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0, -- Price in paise (0 for free tools)
ADD COLUMN IF NOT EXISTS one_time_purchase BOOLEAN DEFAULT false; -- Whether it's a one-time purchase

-- Create tool_purchases table to track individual tool purchases
CREATE TABLE IF NOT EXISTS public.tool_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_id UUID NOT NULL REFERENCES public.financial_tools(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  access_granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for lifetime access
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Enable RLS on tool_purchases
ALTER TABLE public.tool_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for tool_purchases
CREATE POLICY "Users can view their own tool purchases" 
ON public.tool_purchases 
FOR SELECT 
USING (user_id IN (SELECT users.id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can create their own tool purchases" 
ON public.tool_purchases 
FOR INSERT 
WITH CHECK (user_id IN (SELECT users.id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Admins can manage all tool purchases" 
ON public.tool_purchases 
FOR ALL 
USING (get_current_user_role() = 'ADMIN'::user_role);

-- Add trigger for updated_at
CREATE TRIGGER update_tool_purchases_updated_at
BEFORE UPDATE ON public.tool_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update financial_tools with pricing (making some premium tools paid)
UPDATE public.financial_tools 
SET price = 29900, one_time_purchase = true -- ₹299 one-time
WHERE access_level = 'premium' AND name IN ('Tax Calculator', 'Portfolio Tracker', 'Retirement Calculator');

-- Keep some tools free
UPDATE public.financial_tools 
SET price = 0, one_time_purchase = false
WHERE access_level = 'free' OR name IN ('EMI Calculator', 'SIP Calculator', 'Budget Planner');
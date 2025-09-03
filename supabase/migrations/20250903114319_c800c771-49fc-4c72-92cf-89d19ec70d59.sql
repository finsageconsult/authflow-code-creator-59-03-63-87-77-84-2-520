-- Create credit types enum
CREATE TYPE public.credit_type AS ENUM ('SESSION_1_1', 'WEBINAR');

-- Create owner types enum  
CREATE TYPE public.owner_type AS ENUM ('ORG', 'USER');

-- Create credit wallets table
CREATE TABLE public.credit_wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_type public.owner_type NOT NULL,
    owner_id UUID NOT NULL,
    credit_type public.credit_type NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(owner_type, owner_id, credit_type)
);

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES public.credit_wallets(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL, -- positive for credits, negative for debits
    reason TEXT NOT NULL,
    booking_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.users(id)
);

-- Enable RLS
ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_wallets
CREATE POLICY "Admins can manage all wallets" 
ON public.credit_wallets FOR ALL 
USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "HR can view org and employee wallets" 
ON public.credit_wallets FOR SELECT 
USING (
    get_current_user_role() = 'HR' 
    AND (
        (owner_type = 'ORG' AND owner_id = get_current_user_org_id())
        OR 
        (owner_type = 'USER' AND owner_id IN (
            SELECT id FROM users WHERE organization_id = get_current_user_org_id()
        ))
    )
);

CREATE POLICY "HR can manage employee wallets" 
ON public.credit_wallets FOR ALL 
USING (
    get_current_user_role() = 'HR' 
    AND owner_type = 'USER' 
    AND owner_id IN (
        SELECT id FROM users WHERE organization_id = get_current_user_org_id()
    )
);

CREATE POLICY "Users can view their own wallets" 
ON public.credit_wallets FOR SELECT 
USING (
    owner_type = 'USER' 
    AND owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- RLS Policies for credit_transactions
CREATE POLICY "Admins can manage all transactions" 
ON public.credit_transactions FOR ALL 
USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "HR can view org transactions" 
ON public.credit_transactions FOR SELECT 
USING (
    get_current_user_role() = 'HR' 
    AND wallet_id IN (
        SELECT id FROM credit_wallets 
        WHERE (owner_type = 'ORG' AND owner_id = get_current_user_org_id())
        OR (owner_type = 'USER' AND owner_id IN (
            SELECT id FROM users WHERE organization_id = get_current_user_org_id()
        ))
    )
);

CREATE POLICY "HR can create employee transactions" 
ON public.credit_transactions FOR INSERT 
WITH CHECK (
    get_current_user_role() = 'HR' 
    AND wallet_id IN (
        SELECT id FROM credit_wallets 
        WHERE owner_type = 'USER' 
        AND owner_id IN (
            SELECT id FROM users WHERE organization_id = get_current_user_org_id()
        )
    )
);

CREATE POLICY "Users can view their transactions" 
ON public.credit_transactions FOR SELECT 
USING (
    wallet_id IN (
        SELECT id FROM credit_wallets 
        WHERE owner_type = 'USER' 
        AND owner_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    )
);

-- Create triggers for updated_at
CREATE TRIGGER update_credit_wallets_updated_at
    BEFORE UPDATE ON public.credit_wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update wallet balance on transaction
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.credit_wallets 
    SET balance = balance + NEW.delta, updated_at = now()
    WHERE id = NEW.wallet_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update wallet balance
CREATE TRIGGER update_wallet_balance_trigger
    AFTER INSERT ON public.credit_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wallet_balance();

-- Create indexes for performance
CREATE INDEX idx_credit_wallets_owner ON public.credit_wallets(owner_type, owner_id);
CREATE INDEX idx_credit_wallets_type ON public.credit_wallets(credit_type);
CREATE INDEX idx_credit_transactions_wallet ON public.credit_transactions(wallet_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at);
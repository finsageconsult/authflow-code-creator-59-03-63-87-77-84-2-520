-- Fix the search_path security issue for the wallet balance function
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.credit_wallets 
    SET balance = balance + NEW.delta, updated_at = now()
    WHERE id = NEW.wallet_id;
    RETURN NEW;
END;
$$;
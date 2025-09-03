-- Fix remaining function search path issues
ALTER FUNCTION public.generate_invoice_number() SET search_path TO 'public';
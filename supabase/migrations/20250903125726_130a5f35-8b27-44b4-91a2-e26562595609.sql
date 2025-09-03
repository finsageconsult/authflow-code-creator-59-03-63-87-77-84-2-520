-- Fix function search path issues by updating the functions to set search_path
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.generate_order_number() SET search_path TO 'public';
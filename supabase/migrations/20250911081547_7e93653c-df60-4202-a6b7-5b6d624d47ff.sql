-- Fix security warnings by setting proper search_path for the functions we just created

-- Update extract_email_domain function with proper search_path
CREATE OR REPLACE FUNCTION extract_email_domain(email TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LOWER(SUBSTRING(email FROM '@(.*)$'));
$$;

-- Update is_corporate_email function with proper search_path  
CREATE OR REPLACE FUNCTION is_corporate_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT (
    extract_email_domain(email) = ANY(ARRAY[
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'yahoo.co.in',
      'rediffmail.com', 'live.com', 'msn.com', 'aol.com', 'icloud.com',
      'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'fastmail.com'
    ])
  );
$$;
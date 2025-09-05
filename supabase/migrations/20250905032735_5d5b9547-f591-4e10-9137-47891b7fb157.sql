-- Enable leaked password protection for enhanced security
UPDATE auth.config 
SET value = 'true' 
WHERE parameter = 'leaked_password_protection';
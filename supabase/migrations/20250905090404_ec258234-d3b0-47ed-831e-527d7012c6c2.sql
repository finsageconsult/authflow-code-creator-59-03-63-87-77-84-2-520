-- Add more sample coaches to the database
INSERT INTO public.users (
  auth_id, 
  name, 
  email, 
  role, 
  status,
  created_at,
  updated_at
) VALUES 
  (gen_random_uuid(), 'Dr. Sarah Johnson', 'sarah.johnson@finsage.com', 'COACH', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'Michael Chen', 'michael.chen@finsage.com', 'COACH', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'Jessica Williams', 'jessica.williams@finsage.com', 'COACH', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'David Rodriguez', 'david.rodriguez@finsage.com', 'COACH', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'Emily Thompson', 'emily.thompson@finsage.com', 'COACH', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'Alex Kumar', 'alex.kumar@finsage.com', 'COACH', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'Maria Garcia', 'maria.garcia@finsage.com', 'COACH', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'James Miller', 'james.miller@finsage.com', 'COACH', 'ACTIVE', now(), now());
-- Insert sample users for testing coach profiles
INSERT INTO users (id, auth_id, name, email, role, status, organization_id, created_at, updated_at)
VALUES 
  ('67486a23-bc75-4465-b1ad-e433a5cba6a3', '67486a23-bc75-4465-b1ad-e433a5cba6a3', 'John Doe', 'john.doe@example.com', 'INDIVIDUAL', 'ACTIVE', NULL, now(), now()),
  ('e4f0f1d7-aabc-4e32-9b5a-e051e0b419c7', 'e4f0f1d7-aabc-4e32-9b5a-e051e0b419c7', 'Jane Smith', 'jane.smith@company.com', 'EMPLOYEE', 'ACTIVE', NULL, now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = now();

-- Insert sample individual programs for the course IDs in enrollments
INSERT INTO individual_programs (id, title, description, category, level, duration, price, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Financial Fitness Bootcamp', 'Complete financial wellness program', 'short-program', 'Beginner', '4 weeks', 449900, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440001', 'Investment Mastery Series', 'Learn to invest like a pro', '1-1-sessions', 'Intermediate', '1 hour', 299900, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Smart Tax Planning', 'Optimize your taxes', 'short-program', 'Beginner', '2 weeks', 199900, now(), now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = now();
-- Insert sample enrollments to demonstrate payout system
INSERT INTO public.enrollments (
  id,
  user_id, 
  coach_id,
  course_id,
  status,
  enrollment_date,
  scheduled_at
) VALUES 
  (gen_random_uuid(), '78ff414d-c471-4901-b17f-7b0bff3a43b5', 'e4a47415-c3d6-44d2-8222-7cfb488d53a4', 'd3dfd158-b838-49d2-8732-acf11d4a1936', 'confirmed', '2025-09-01 10:00:00+00', '2025-09-15 14:00:00+00'),
  (gen_random_uuid(), 'd3fef0e8-693c-48ef-aba4-2f864b10e2c4', 'e4a47415-c3d6-44d2-8222-7cfb488d53a4', 'ef670e80-1cc7-47cd-aefd-0d33a412f0f5', 'active', '2025-09-05 11:30:00+00', '2025-09-16 15:30:00+00'),
  (gen_random_uuid(), '67486a23-bc75-4465-b1ad-e433a5cba6a3', '6afff98a-210e-4c32-8f21-2e2b7a9cf091', 'daf2583d-c32c-4536-aefc-a4547335b095', 'completed', '2025-08-15 09:00:00+00', '2025-08-20 16:00:00+00'),
  (gen_random_uuid(), '58c73600-bbbf-4191-bb3c-595bef105fde', 'da6f4b20-83be-4c5d-94d3-7742f705b523', 'd3dfd158-b838-49d2-8732-acf11d4a1936', 'confirmed', '2025-09-10 12:00:00+00', '2025-09-18 17:00:00+00');

-- Insert sample individual purchases to demonstrate payout system  
INSERT INTO public.individual_purchases (
  id,
  user_id,
  program_id,
  amount_paid,
  status,
  created_at
) VALUES
  (gen_random_uuid(), '78ff414d-c471-4901-b17f-7b0bff3a43b5', 'd3dfd158-b838-49d2-8732-acf11d4a1936', 499900, 'completed', '2025-09-03 10:30:00+00'),
  (gen_random_uuid(), 'd3fef0e8-693c-48ef-aba4-2f864b10e2c4', 'ef670e80-1cc7-47cd-aefd-0d33a412f0f5', 299900, 'completed', '2025-09-07 14:15:00+00');
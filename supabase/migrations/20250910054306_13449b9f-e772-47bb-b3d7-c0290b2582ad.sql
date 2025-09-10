-- Fix chat_participants RLS policies to allow adding coaches to chats

-- Drop existing policy
DROP POLICY IF EXISTS "Users can join chats" ON public.chat_participants;

-- Create updated policy that allows users to add both themselves and their enrolled coaches
CREATE POLICY "Users can join chats and add coaches" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (
  -- Allow users to add themselves to chats
  user_id IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ) OR
  -- Allow users to add their enrolled coaches to chats
  (
    auth.uid() IN (
      SELECT u.auth_id FROM users u
      JOIN enrollments e ON u.id = e.user_id 
      WHERE e.status = 'confirmed' AND e.coach_id = chat_participants.user_id
    )
  )
);
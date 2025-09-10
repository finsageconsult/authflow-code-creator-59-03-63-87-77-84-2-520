-- Fix the chats RLS policies to allow individual users to create chats with their coaches
-- Updated to work with existing database schema

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view their chats" ON public.chats; 
DROP POLICY IF EXISTS "Users can update their chats" ON public.chats;

-- Create new policies that work for individual users and coaches
CREATE POLICY "Users can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (
  -- Allow if user is creating a chat and they are a participant
  created_by = auth.uid() OR 
  -- Allow coaches to create chats (coaches have role 'COACH')
  auth.uid() IN (
    SELECT auth_id FROM users WHERE role = 'COACH'
  ) OR
  -- Allow individual users to create chats with their enrolled coaches
  auth.uid() IN (
    SELECT u.auth_id FROM users u
    JOIN enrollments e ON u.id = e.user_id 
    WHERE e.status = 'confirmed'
  )
);

CREATE POLICY "Users can view their chats" 
ON public.chats 
FOR SELECT 
USING (
  -- Users can see chats they created
  created_by = auth.uid() OR
  -- Users can see chats they participate in via chat_participants
  id IN (
    SELECT chat_id FROM chat_participants 
    WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  ) OR
  -- Individual users can see chats related to their enrollments
  id IN (
    SELECT c.id FROM chats c
    JOIN enrollments e ON c.metadata->>'enrollment_id' = e.id::text
    WHERE e.user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    ) AND e.status = 'confirmed'
  )
);

CREATE POLICY "Users can update their chats" 
ON public.chats 
FOR UPDATE 
USING (
  -- Users can update chats they created
  created_by = auth.uid() OR
  -- Coaches can update chats for their enrollments
  auth.uid() IN (
    SELECT u.auth_id FROM users u 
    WHERE u.role = 'COACH'
  )
);
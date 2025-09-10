-- Fix the chats RLS policies to allow individual users to create chats with their coaches
-- Simplified approach based on actual table structure

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view their chats" ON public.chats; 
DROP POLICY IF EXISTS "Users can update their chats" ON public.chats;

-- Create new simplified policies
CREATE POLICY "Users can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to create chats
  auth.uid() IS NOT NULL AND
  created_by IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  )
);

CREATE POLICY "Users can view their chats" 
ON public.chats 
FOR SELECT 
USING (
  -- Users can see chats they created
  created_by IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ) OR
  -- Users can see chats they participate in via chat_participants
  id IN (
    SELECT chat_id FROM chat_participants 
    WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their chats" 
ON public.chats 
FOR UPDATE 
USING (
  -- Users can update chats they created
  created_by IN (
    SELECT id FROM users WHERE auth_id = auth.uid()
  ) OR
  -- Users can update chats they participate in
  id IN (
    SELECT chat_id FROM chat_participants 
    WHERE user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  )
);
-- Fix infinite recursion in chat_participants RLS policy
-- The current SELECT policy references chat_participants within itself, causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants in their chats" ON chat_participants;

-- Create a simpler, non-recursive policy
-- Users can view participants in chats they are part of
CREATE POLICY "Users can view chat participants" 
ON chat_participants 
FOR SELECT 
USING (
  -- User can see participants if they are also a participant in the same chat
  chat_id IN (
    SELECT DISTINCT cp2.chat_id 
    FROM chat_participants cp2 
    JOIN users u ON u.id = cp2.user_id 
    WHERE u.auth_id = auth.uid() AND cp2.is_active = true
  )
);

-- Also fix chats RLS policy to be more efficient
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;

CREATE POLICY "Users can view chats they participate in" 
ON chats 
FOR SELECT 
USING (
  -- User can see chats where they are a participant
  EXISTS (
    SELECT 1 FROM chat_participants cp 
    JOIN users u ON u.id = cp.user_id 
    WHERE cp.chat_id = chats.id 
    AND u.auth_id = auth.uid() 
    AND cp.is_active = true
  )
);
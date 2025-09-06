-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can view their chats" ON chats;
DROP POLICY IF EXISTS "Users can update their chats" ON chats;
DROP POLICY IF EXISTS "Users can join chats" ON chat_participants;
DROP POLICY IF EXISTS "Users can view their participations" ON chat_participants;
DROP POLICY IF EXISTS "Users can update their participations" ON chat_participants;

-- Create proper RLS policies for chats table
CREATE POLICY "Allow authenticated users to create chats" ON chats
FOR INSERT 
TO authenticated
WITH CHECK (
  created_by = get_current_user_id()
);

CREATE POLICY "Users can view chats they participate in" ON chats
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT cp.chat_id 
    FROM chat_participants cp 
    WHERE cp.user_id = get_current_user_id() 
    AND cp.is_active = true
  )
);

CREATE POLICY "Chat creators can update their chats" ON chats
FOR UPDATE 
TO authenticated
USING (created_by = get_current_user_id());

-- Create proper RLS policies for chat_participants table
CREATE POLICY "Allow users to join chats as participants" ON chat_participants
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = get_current_user_id() 
  OR 
  chat_id IN (
    SELECT id FROM chats WHERE created_by = get_current_user_id()
  )
);

CREATE POLICY "Users can view chat participants" ON chat_participants
FOR SELECT 
TO authenticated
USING (
  user_id = get_current_user_id()
  OR 
  chat_id IN (
    SELECT cp.chat_id 
    FROM chat_participants cp 
    WHERE cp.user_id = get_current_user_id() 
    AND cp.is_active = true
  )
);

CREATE POLICY "Users can update their own participation" ON chat_participants
FOR UPDATE 
TO authenticated
USING (user_id = get_current_user_id());
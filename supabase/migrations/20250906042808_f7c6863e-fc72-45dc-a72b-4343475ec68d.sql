-- Check current RLS policies for chats table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'chats';

-- If no proper policies exist, create them
-- Enable RLS on chats table (if not already enabled)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Policy for coaches and users to create chats
CREATE POLICY "Users can create chats" ON chats
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE id = created_by
  )
);

-- Policy for coaches and users to view their chats
CREATE POLICY "Users can view their chats" ON chats
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT u.auth_id 
    FROM users u 
    JOIN chat_participants cp ON u.id = cp.user_id 
    WHERE cp.chat_id = chats.id AND cp.is_active = true
  )
);

-- Policy for coaches and users to update their chats
CREATE POLICY "Users can update their chats" ON chats
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT u.auth_id 
    FROM users u 
    JOIN chat_participants cp ON u.id = cp.user_id 
    WHERE cp.chat_id = chats.id AND cp.is_active = true
  )
);

-- Also ensure chat_participants table has proper RLS policies
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Policy for users to join chats they're invited to
CREATE POLICY "Users can join chats" ON chat_participants
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  )
);

-- Policy for users to view their chat participations
CREATE POLICY "Users can view their participations" ON chat_participants
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  )
);

-- Policy for users to update their chat participations
CREATE POLICY "Users can update their participations" ON chat_participants
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  )
);
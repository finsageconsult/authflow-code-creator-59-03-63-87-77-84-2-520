-- Fix the chat_participants RLS policy to avoid infinite recursion
-- Drop the current problematic policies
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can view chats they participate in" ON chats;

-- Create a simpler approach using security definer functions
CREATE OR REPLACE FUNCTION public.get_user_chat_ids()
RETURNS TABLE(chat_id uuid) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT DISTINCT cp.chat_id 
  FROM chat_participants cp 
  JOIN users u ON u.id = cp.user_id 
  WHERE u.auth_id = auth.uid() AND cp.is_active = true;
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view chat participants" 
ON chat_participants 
FOR SELECT 
USING (chat_id IN (SELECT get_user_chat_ids()));

CREATE POLICY "Users can view chats they participate in" 
ON chats 
FOR SELECT 
USING (id IN (SELECT get_user_chat_ids()));
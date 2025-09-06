-- Create RPC function to handle chat creation with proper authentication
CREATE OR REPLACE FUNCTION public.create_coaching_chat(
  chat_name text,
  participant_id uuid,
  org_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  chat_type text,
  name text,
  created_by uuid,
  organization_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_message_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  new_chat_id uuid;
BEGIN
  -- Get current user ID using the helper function
  SELECT get_current_user_id() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Create the chat
  INSERT INTO public.chats (chat_type, name, created_by, organization_id)
  VALUES ('coaching', chat_name, current_user_id, org_id)
  RETURNING chats.id INTO new_chat_id;
  
  -- Add participants
  INSERT INTO public.chat_participants (chat_id, user_id, role)
  VALUES 
    (new_chat_id, current_user_id, 'coach'),
    (new_chat_id, participant_id, 'student');
  
  -- Return the created chat
  RETURN QUERY
  SELECT 
    c.id,
    c.chat_type,
    c.name,
    c.created_by,
    c.organization_id,
    c.created_at,
    c.updated_at,
    c.last_message_at
  FROM public.chats c
  WHERE c.id = new_chat_id;
END;
$$;
-- Create chat system tables
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  chat_type TEXT NOT NULL DEFAULT 'direct', -- 'direct', 'group'
  created_by UUID NOT NULL,
  organization_id UUID,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(chat_id, user_id)
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'file', 'image', 'audio'
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  reply_to_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

CREATE TABLE public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline', -- 'online', 'away', 'busy', 'offline'
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  typing_in_chat UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view chats they participate in" 
ON public.chats 
FOR SELECT 
USING (id IN (
  SELECT cp.chat_id 
  FROM public.chat_participants cp 
  JOIN public.users u ON u.id = cp.user_id 
  WHERE u.auth_id = auth.uid() AND cp.is_active = true
));

CREATE POLICY "Users can create chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (created_by IN (
  SELECT id FROM public.users WHERE auth_id = auth.uid()
));

CREATE POLICY "Chat creators can update their chats" 
ON public.chats 
FOR UPDATE 
USING (created_by IN (
  SELECT id FROM public.users WHERE auth_id = auth.uid()
));

-- RLS Policies for chat_participants
CREATE POLICY "Users can view participants in their chats" 
ON public.chat_participants 
FOR SELECT 
USING (chat_id IN (
  SELECT cp.chat_id 
  FROM public.chat_participants cp 
  JOIN public.users u ON u.id = cp.user_id 
  WHERE u.auth_id = auth.uid() AND cp.is_active = true
));

CREATE POLICY "Users can join chats" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM public.users WHERE auth_id = auth.uid()
));

CREATE POLICY "Users can update their own participation" 
ON public.chat_participants 
FOR UPDATE 
USING (user_id IN (
  SELECT id FROM public.users WHERE auth_id = auth.uid()
));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their chats" 
ON public.chat_messages 
FOR SELECT 
USING (chat_id IN (
  SELECT cp.chat_id 
  FROM public.chat_participants cp 
  JOIN public.users u ON u.id = cp.user_id 
  WHERE u.auth_id = auth.uid() AND cp.is_active = true
));

CREATE POLICY "Users can send messages to their chats" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  sender_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) 
  AND chat_id IN (
    SELECT cp.chat_id 
    FROM public.chat_participants cp 
    JOIN public.users u ON u.id = cp.user_id 
    WHERE u.auth_id = auth.uid() AND cp.is_active = true
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (sender_id IN (
  SELECT id FROM public.users WHERE auth_id = auth.uid()
));

-- RLS Policies for user_presence
CREATE POLICY "Users can view presence of users in their chats" 
ON public.user_presence 
FOR SELECT 
USING (user_id IN (
  SELECT DISTINCT cp2.user_id 
  FROM public.chat_participants cp1 
  JOIN public.chat_participants cp2 ON cp1.chat_id = cp2.chat_id 
  JOIN public.users u ON u.id = cp1.user_id 
  WHERE u.auth_id = auth.uid() AND cp1.is_active = true AND cp2.is_active = true
));

CREATE POLICY "Users can update their own presence" 
ON public.user_presence 
FOR ALL 
USING (user_id IN (
  SELECT id FROM public.users WHERE auth_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_user_presence_user_id ON public.user_presence(user_id);

-- Create function to update last_message_at
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating last_message_at
CREATE TRIGGER update_chat_last_message_trigger
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_last_message();

-- Create function to update presence timestamp
CREATE OR REPLACE FUNCTION public.update_presence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for presence updates
CREATE TRIGGER update_presence_timestamp_trigger
BEFORE UPDATE ON public.user_presence
FOR EACH ROW
EXECUTE FUNCTION public.update_presence_timestamp();

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', false);

-- Create storage policies for chat files
CREATE POLICY "Users can upload files to chats they participate in" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view files in chats they participate in" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-files' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.chat_participants cp 
      JOIN public.users u ON u.id = cp.user_id 
      WHERE u.auth_id = auth.uid() 
      AND cp.chat_id::text = (storage.foldername(name))[2]
      AND cp.is_active = true
    )
  )
);

CREATE POLICY "Users can delete their own uploaded files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
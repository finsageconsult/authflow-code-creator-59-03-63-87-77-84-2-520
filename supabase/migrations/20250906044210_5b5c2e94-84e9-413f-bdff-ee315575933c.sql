-- Enable real-time for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;

-- Set replica identity for real-time updates
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_participants REPLICA IDENTITY FULL;
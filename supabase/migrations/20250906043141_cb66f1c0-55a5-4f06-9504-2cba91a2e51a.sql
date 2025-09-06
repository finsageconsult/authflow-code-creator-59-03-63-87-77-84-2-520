-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('chats', 'chat_participants')
ORDER BY tablename, policyname;
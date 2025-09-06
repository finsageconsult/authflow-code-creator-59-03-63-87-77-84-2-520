-- Add foreign key constraints that might be missing
-- Only add if they don't already exist

DO $$
BEGIN
    -- Check and add chat_participants to chats relationship
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chat_participants_chat_id_fkey'
    ) THEN
        ALTER TABLE chat_participants 
        ADD CONSTRAINT chat_participants_chat_id_fkey 
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;
    END IF;

    -- Check and add chat_participants to users relationship
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chat_participants_user_id_fkey'
    ) THEN
        ALTER TABLE chat_participants 
        ADD CONSTRAINT chat_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Check and add chat_messages to chats relationship
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chat_messages_chat_id_fkey'
    ) THEN
        ALTER TABLE chat_messages 
        ADD CONSTRAINT chat_messages_chat_id_fkey 
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;
    END IF;

    -- Check and add chat_messages to users relationship
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chat_messages_sender_id_fkey'
    ) THEN
        ALTER TABLE chat_messages 
        ADD CONSTRAINT chat_messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
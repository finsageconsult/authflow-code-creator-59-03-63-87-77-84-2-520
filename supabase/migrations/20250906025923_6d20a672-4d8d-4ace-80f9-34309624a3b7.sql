-- Add missing foreign key relationships for chat system
ALTER TABLE chat_participants 
ADD CONSTRAINT chat_participants_chat_id_fkey 
FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;

ALTER TABLE chat_participants 
ADD CONSTRAINT chat_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_chat_id_fkey 
FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE;

ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE chats 
ADD CONSTRAINT chats_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- Add missing foreign key relationships for enrollments
ALTER TABLE enrollments 
ADD CONSTRAINT enrollments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE enrollments 
ADD CONSTRAINT enrollments_coach_id_fkey 
FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE enrollments 
ADD CONSTRAINT enrollments_course_id_fkey 
FOREIGN KEY (course_id) REFERENCES individual_programs(id) ON DELETE CASCADE;
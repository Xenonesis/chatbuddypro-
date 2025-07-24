-- Fix missing chat_messages table
-- Run this in Supabase SQL Editor

-- First, check if the table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'chat_messages'
);

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for chat_messages
DROP POLICY IF EXISTS "Users can only access their own messages" ON chat_messages;
CREATE POLICY "Users can only access their own messages" 
  ON chat_messages FOR ALL 
  USING (auth.uid() = user_id);

-- Verify the table was created successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test that we can insert a message (this will be rolled back)
BEGIN;
  -- This is just a test - we'll rollback
  INSERT INTO chat_messages (
    chat_id, 
    user_id, 
    role, 
    content
  ) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'user',
    'Test message'
  );
  
  SELECT 'Test insert successful - chat_messages table is working correctly' as result;
ROLLBACK;

SELECT 'chat_messages table setup completed successfully!' as final_result;

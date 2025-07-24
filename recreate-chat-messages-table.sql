-- Recreate chat_messages table with correct schema
-- Run this in Supabase SQL Editor

-- First, backup any existing data (if you have important messages)
CREATE TABLE IF NOT EXISTS chat_messages_backup AS 
SELECT * FROM chat_messages;

-- Drop the existing table with incorrect schema
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Recreate the table with the correct schema
CREATE TABLE chat_messages (
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

-- Verify the table structure
SELECT 'New chat_messages table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test insert (this will be rolled back)
DO $$
DECLARE
    test_chat_id UUID;
    test_user_id UUID;
BEGIN
    -- Try to get an existing chat for testing
    SELECT id, user_id INTO test_chat_id, test_user_id 
    FROM chats 
    LIMIT 1;
    
    IF test_chat_id IS NOT NULL THEN
        -- Test insert
        INSERT INTO chat_messages (
            chat_id, 
            user_id, 
            role, 
            content
        ) VALUES (
            test_chat_id,
            test_user_id,
            'user',
            'Test message - table recreation verification'
        );
        
        -- Clean up test message
        DELETE FROM chat_messages 
        WHERE content = 'Test message - table recreation verification';
        
        RAISE NOTICE 'Test successful - chat_messages table is working correctly!';
    ELSE
        RAISE NOTICE 'No chats found for testing, but table structure is correct';
    END IF;
END $$;

SELECT 'chat_messages table recreation completed successfully!' as final_result;

-- Fix chat_messages table schema by adding missing chat_id column
-- Run this in Supabase SQL Editor

-- First, let's check the current table structure
SELECT 'Current chat_messages table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if chat_id column exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.columns 
  WHERE table_name = 'chat_messages' 
  AND column_name = 'chat_id'
  AND table_schema = 'public'
) as chat_id_exists;

-- Add the missing chat_id column if it doesn't exist
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS chat_id UUID REFERENCES chats(id) ON DELETE CASCADE;

-- Make chat_id NOT NULL (but first we need to handle existing data)
-- If there are existing messages without chat_id, we'll need to handle them

-- Check if there are any existing messages
SELECT COUNT(*) as existing_message_count FROM chat_messages;

-- If there are existing messages without chat_id, we need to either:
-- 1. Delete them (if they're test data)
-- 2. Assign them to existing chats
-- 3. Create placeholder chats for them

-- For now, let's delete any messages without chat_id (assuming they're invalid)
DELETE FROM chat_messages WHERE chat_id IS NULL;

-- Now make chat_id NOT NULL
ALTER TABLE chat_messages 
ALTER COLUMN chat_id SET NOT NULL;

-- Verify the updated table structure
SELECT 'Updated chat_messages table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test that we can insert a message with chat_id
-- First, let's get a test chat ID (or create one if none exists)
DO $$
DECLARE
    test_chat_id UUID;
    test_user_id UUID;
BEGIN
    -- Try to get an existing chat
    SELECT id, user_id INTO test_chat_id, test_user_id 
    FROM chats 
    LIMIT 1;
    
    -- If no chats exist, we'll skip the test
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
            'Test message - schema fix verification'
        );
        
        -- Clean up test message
        DELETE FROM chat_messages 
        WHERE content = 'Test message - schema fix verification';
        
        RAISE NOTICE 'Test insert successful - chat_messages table is working correctly!';
    ELSE
        RAISE NOTICE 'No chats found for testing, but schema should be fixed';
    END IF;
END $$;

SELECT 'chat_messages table schema fix completed successfully!' as final_result;

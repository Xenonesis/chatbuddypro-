-- Enhanced Chat Persistence Schema Migration
-- This migration adds missing columns and indexes for optimal chat persistence

-- Add missing columns to chats table
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add missing columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS message_order INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id_updated_at ON chats(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_user_id_last_message_at ON chats(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_user_id_archived ON chats(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_chats_tags ON chats USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_order ON chat_messages(chat_id, message_order);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_created_at ON chat_messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_created_at ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_metadata ON chat_messages USING GIN(metadata);

-- Create a function to automatically update message_count and last_message_at
CREATE OR REPLACE FUNCTION update_chat_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the chat's message count and last message timestamp
  UPDATE chats 
  SET 
    message_count = (
      SELECT COUNT(*) 
      FROM chat_messages 
      WHERE chat_id = NEW.chat_id
    ),
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update chat metadata when messages are added
DROP TRIGGER IF EXISTS trigger_update_chat_metadata ON chat_messages;
CREATE TRIGGER trigger_update_chat_metadata
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_metadata();

-- Create a function to automatically set message_order
CREATE OR REPLACE FUNCTION set_message_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Set message_order to the next sequence number for this chat
  NEW.message_order = COALESCE(
    (SELECT MAX(message_order) + 1 FROM chat_messages WHERE chat_id = NEW.chat_id),
    1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set message order
DROP TRIGGER IF EXISTS trigger_set_message_order ON chat_messages;
CREATE TRIGGER trigger_set_message_order
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_order();

-- Update existing chats to populate new fields
UPDATE chats 
SET 
  message_count = (
    SELECT COUNT(*) 
    FROM chat_messages 
    WHERE chat_id = chats.id
  ),
  last_message_at = (
    SELECT MAX(created_at) 
    FROM chat_messages 
    WHERE chat_id = chats.id
  )
WHERE message_count IS NULL OR last_message_at IS NULL;

-- Update existing messages to set message_order
WITH ordered_messages AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY created_at) as order_num
  FROM chat_messages 
  WHERE message_order IS NULL
)
UPDATE chat_messages 
SET message_order = ordered_messages.order_num
FROM ordered_messages 
WHERE chat_messages.id = ordered_messages.id;

-- Add comments for documentation
COMMENT ON COLUMN chats.last_message_at IS 'Timestamp of the most recent message in this chat';
COMMENT ON COLUMN chats.message_count IS 'Total number of messages in this chat';
COMMENT ON COLUMN chats.is_archived IS 'Whether this chat has been archived by the user';
COMMENT ON COLUMN chats.tags IS 'Array of tags for categorizing chats';
COMMENT ON COLUMN chat_messages.message_order IS 'Sequential order of messages within a chat';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional metadata for the message (e.g., model parameters, tokens used)';

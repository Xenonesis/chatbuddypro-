-- Add user_email and user_name columns to chats table
-- Run this in Supabase SQL Editor

-- Add the missing columns to the chats table
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create the save_chat_with_user_info RPC function
CREATE OR REPLACE FUNCTION save_chat_with_user_info(
  p_user_id UUID,
  p_title TEXT,
  p_model TEXT,
  p_user_email TEXT,
  p_user_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_chat_id UUID;
BEGIN
  -- Insert new chat record
  INSERT INTO chats (
    user_id,
    title,
    model,
    user_email,
    user_name,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_title,
    p_model,
    p_user_email,
    p_user_name,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_chat_id;
  
  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

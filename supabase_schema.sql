-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables

-- Users table (managed by Supabase Auth)
-- This is automatically created by Supabase

-- User Profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_profiles
CREATE POLICY "Users can only access their own profiles" 
  ON user_profiles FOR ALL 
  USING (auth.uid() = user_id);

-- User Preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  api_keys JSONB DEFAULT '{}'::jsonb, -- Encrypted API keys stored as JSON
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security) on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy for user_preferences
CREATE POLICY "Users can only access their own preferences" 
  ON user_preferences FOR ALL 
  USING (auth.uid() = user_id);

-- Chat history table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  last_message TEXT,
  model VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create policy for chats
CREATE POLICY "Users can only access their own chats" 
  ON chats FOR ALL 
  USING (auth.uid() = user_id);

-- Chat messages table
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
CREATE POLICY "Users can only access their own messages" 
  ON chat_messages FOR ALL 
  USING (auth.uid() = user_id);

-- User backups table (for automated backup)
CREATE TABLE user_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- Full backup of user data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_backups
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own backups, but not modify them
CREATE POLICY "Users can only view their own backups" 
  ON user_backups FOR SELECT 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_user_backups_user_id ON user_backups(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Create a view for analytics (admin only)
CREATE VIEW chat_analytics AS
SELECT
  u.email,
  COUNT(DISTINCT c.id) as chat_count,
  COUNT(m.id) as message_count,
  MIN(c.created_at) as first_chat,
  MAX(c.created_at) as last_chat
FROM
  auth.users u
LEFT JOIN
  chats c ON u.id = c.user_id
LEFT JOIN
  chat_messages m ON c.id = m.chat_id
GROUP BY
  u.id, u.email;

-- Secure the analytics view
REVOKE ALL ON chat_analytics FROM PUBLIC;
GRANT SELECT ON chat_analytics TO service_role; -- Only service_role can access 
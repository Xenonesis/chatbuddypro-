-- Manual Real-time Settings Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Add preferences column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added preferences column to user_preferences table';
  ELSE
    RAISE NOTICE 'Preferences column already exists';
  END IF;
END $$;

-- 2. Create index on preferences column for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_preferences 
  ON user_preferences USING GIN (preferences);

-- 3. Create function to update user settings securely
CREATE OR REPLACE FUNCTION update_user_settings(
  p_user_id UUID,
  p_settings JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  settings_updated BOOLEAN := FALSE;
BEGIN
  -- Validate user_id matches authenticated user
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update settings for another user';
  END IF;

  -- Update the preferences column with the new settings
  UPDATE user_preferences 
  SET 
    preferences = COALESCE(preferences, '{}'::jsonb) || p_settings,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  GET DIAGNOSTICS settings_updated = ROW_COUNT;
  
  -- If no row was updated, create a new preferences record
  IF NOT settings_updated THEN
    INSERT INTO user_preferences (user_id, preferences)
    VALUES (p_user_id, p_settings)
    ON CONFLICT (user_id) DO UPDATE SET
      preferences = COALESCE(user_preferences.preferences, '{}'::jsonb) || p_settings,
      updated_at = NOW();
    
    settings_updated := TRUE;
  END IF;
  
  RETURN settings_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to get user settings
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  theme VARCHAR(20),
  language VARCHAR(10),
  api_keys JSONB,
  ai_providers JSONB,
  preferences JSONB,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Validate user_id matches authenticated user
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot get settings for another user';
  END IF;

  RETURN QUERY
  SELECT 
    up.user_id,
    up.theme,
    up.language,
    up.api_keys,
    up.ai_providers,
    up.preferences,
    up.updated_at
  FROM user_preferences up
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION update_user_settings(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_settings(UUID) TO authenticated;

-- 6. Enable real-time for user_preferences table (if not already enabled)
-- Note: This might need to be done in the Supabase dashboard under Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;

-- 7. Create a notification function for settings changes
CREATE OR REPLACE FUNCTION notify_settings_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_payload JSON;
BEGIN
  -- Create notification payload with relevant data
  notification_payload = json_build_object(
    'table', TG_TABLE_NAME,
    'type', TG_OP,
    'user_id', COALESCE(NEW.user_id, OLD.user_id),
    'timestamp', NOW()
  );

  -- Send notification
  PERFORM pg_notify('settings_changed', notification_payload::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for user_preferences changes
DROP TRIGGER IF EXISTS settings_change_trigger ON user_preferences;
CREATE TRIGGER settings_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION notify_settings_change();

-- 9. Ensure RLS policies are in place
DROP POLICY IF EXISTS "Users can only access their own preferences" ON user_preferences;
CREATE POLICY "Users can only access their own preferences" 
  ON user_preferences FOR ALL 
  USING (auth.uid() = user_id);

-- 10. Grant necessary permissions for real-time
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON user_preferences TO anon, authenticated;
GRANT ALL ON user_preferences TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Real-time settings setup completed successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Enable real-time for user_preferences in Supabase Dashboard > Database > Replication';
  RAISE NOTICE '2. Restart your Next.js development server';
  RAISE NOTICE '3. Test the real-time functionality';
END $$;
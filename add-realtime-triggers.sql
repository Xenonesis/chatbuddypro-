-- Enable real-time for user_preferences table
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;

-- Create a function to notify about settings changes
CREATE OR REPLACE FUNCTION notify_settings_change()
RETURNS TRIGGER AS $
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
$ LANGUAGE plpgsql;

-- Create trigger for user_preferences changes
DROP TRIGGER IF EXISTS settings_change_trigger ON user_preferences;
CREATE TRIGGER settings_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION notify_settings_change();

-- Create a function to handle real-time settings sync
CREATE OR REPLACE FUNCTION handle_settings_sync()
RETURNS TRIGGER AS $
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- Log the change for debugging
  INSERT INTO user_backups (user_id, data)
  VALUES (
    NEW.user_id,
    json_build_object(
      'type', 'settings_update',
      'timestamp', NOW(),
      'preferences', row_to_json(NEW)
    )
  );
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for automatic settings sync logging
DROP TRIGGER IF EXISTS settings_sync_trigger ON user_preferences;
CREATE TRIGGER settings_sync_trigger
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_settings_sync();

-- Add a preferences column to user_preferences if it doesn't exist
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'preferences'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added preferences column to user_preferences table';
  END IF;
END$;

-- Create an index on the preferences column for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_preferences 
  ON user_preferences USING GIN (preferences);

-- Create a function to get user settings with real-time support
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  theme VARCHAR(20),
  language VARCHAR(10),
  api_keys JSONB,
  ai_providers JSONB,
  preferences JSONB,
  updated_at TIMESTAMPTZ
) AS $
BEGIN
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for real-time
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON user_preferences TO anon, authenticated;
GRANT ALL ON user_preferences TO authenticated;

-- Create a view for real-time settings monitoring
CREATE OR REPLACE VIEW user_settings_realtime AS
SELECT 
  user_id,
  theme,
  language,
  preferences,
  updated_at,
  -- Don't expose encrypted API keys in the view
  CASE 
    WHEN api_keys IS NOT NULL THEN 
      json_build_object('has_keys', jsonb_object_keys(api_keys))
    ELSE NULL 
  END as api_keys_info,
  CASE 
    WHEN ai_providers IS NOT NULL THEN
      jsonb_object_keys(ai_providers)
    ELSE NULL
  END as available_providers
FROM user_preferences;

-- Enable RLS on the view
ALTER VIEW user_settings_realtime SET (security_barrier = true);

-- Grant access to the view
GRANT SELECT ON user_settings_realtime TO authenticated;

-- Create a function to update user settings with validation
CREATE OR REPLACE FUNCTION update_user_settings(
  p_user_id UUID,
  p_settings JSONB
)
RETURNS BOOLEAN AS $
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
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_settings(UUID, JSONB) TO authenticated;
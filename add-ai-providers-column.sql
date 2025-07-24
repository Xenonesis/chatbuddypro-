-- Add the ai_providers column to the existing user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS ai_providers JSONB DEFAULT '{
  "openai": {"enabled": false, "api_keys": {}},
  "gemini": {"enabled": false, "api_keys": {}},
  "mistral": {"enabled": false, "api_keys": {}},
  "claude": {"enabled": false, "api_keys": {}},
  "llama": {"enabled": false, "api_keys": {}},
  "deepseek": {"enabled": false, "api_keys": {}}
}'::jsonb;

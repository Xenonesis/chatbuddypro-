-- Add unique constraint to prevent duplicate user profiles
-- Run this in Supabase SQL Editor

-- First, let's check if there are any remaining duplicates
SELECT user_id, COUNT(*) as profile_count
FROM user_profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Verify the constraint was added
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
AND contype = 'u';

-- Also add an index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Check the final table structure
\d user_profiles;

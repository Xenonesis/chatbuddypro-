# Database Management Guide

This guide provides information on managing and troubleshooting the Supabase database for this application.

## Setup

The application uses Supabase as its database backend. Before using any of the database management tools, make sure you have the following environment variables set:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can set these in a `.env` file in the root directory.

## Database Management Scripts

The application includes several scripts to help manage and troubleshoot the database:

### Check Database Health

```
npm run check-database
```

This script performs a comprehensive check of your database:
- Verifies database connection
- Checks if all required tables exist
- Verifies all required columns are present
- Attempts to repair any issues automatically
- Runs the API key migration if needed

Run this script whenever you encounter database-related errors or after updating the application.

### Migrate API Keys

```
npm run migrate-api-keys
```

This script migrates API keys from the legacy format to the new structured format. The migration:
- Moves API keys from the `api_keys` field to the structured `ai_providers` field
- Preserves existing API keys and their associations
- Enables the corresponding AI providers
- Only migrates keys that haven't been migrated already

### Fix AI Providers Column

```
npm run fix-ai-providers
```

This script specifically adds the `ai_providers` column to the `user_preferences` table if it doesn't exist. Use this script if you encounter the error `column "ai_providers" does not exist`.

### Clean Up Duplicate Records

```
npm run cleanup-db
```

This script cleans up duplicate records in the database, particularly for user preferences. It's useful if you've encountered issues with multiple preference records for the same user.

### Verify Supabase Setup

```
npm run verify-supabase
```

Verifies your Supabase connection and basic permissions.

## Common Database Issues and Solutions

### "Relation already exists" Error

If you see an error like `ERROR: 42P07: relation "user_profiles" already exists`, it means you're trying to create a table that already exists. Our schema scripts have been updated to use `IF NOT EXISTS` to avoid this error, but you may still encounter it with older scripts.

**Solution:** Run the check-database script which will safely apply schema changes:
```
npm run check-database
```

### "Column 'ai_providers' does not exist" Error

If you see an error like `ERROR: 42703: column "ai_providers" does not exist`, it means the database is trying to access the `ai_providers` column but it hasn't been created yet.

**Solution:** Run the fix-ai-providers script to add the column:
```
npm run fix-ai-providers
```

Then run the migration script:
```
npm run migrate-api-keys
```

If that doesn't work, try the general database check:
```
npm run check-database
```

If you continue to have issues, you can manually add the column by running this SQL in the Supabase SQL Editor:
```sql
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS ai_providers JSONB DEFAULT '{
  "openai": {"enabled": false, "api_keys": {}},
  "gemini": {"enabled": false, "api_keys": {}},
  "mistral": {"enabled": false, "api_keys": {}},
  "claude": {"enabled": false, "api_keys": {}},
  "llama": {"enabled": false, "api_keys": {}},
  "deepseek": {"enabled": false, "api_keys": {}}
}'::jsonb;
```

### Missing API Keys

If API keys aren't being saved or retrieved properly, it could be due to:
1. Missing the `ai_providers` column in the `user_preferences` table
2. Legacy API keys haven't been migrated to the new format

**Solution:** Run the migration script:
```
npm run migrate-api-keys
```

### Database Connection Issues

If you're experiencing connection problems:

1. Verify your environment variables are set correctly
2. Check that your Supabase project is running and accessible
3. Ensure your IP address is allowed in Supabase's network restrictions
4. Verify that the service role key has sufficient permissions

Run the verification script to check connectivity:
```
npm run verify-supabase
```

## Manual Database Repairs

If the automated scripts don't fix your issues, you can manually repair the database by running the SQL script directly in the Supabase SQL Editor:

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase_schema.sql` from this project
4. Paste into the SQL Editor and run the script

## Backing Up Your Data

It's recommended to regularly back up your database, especially before making schema changes:

1. Go to your Supabase Dashboard
2. Navigate to Project Settings > Database
3. Under "Database", find the "Backups" section
4. Click "Create a new backup"

## Adding New Tables or Columns

When extending the database schema:

1. Update the `supabase_schema.sql` file with your new tables or columns
2. Use `CREATE TABLE IF NOT EXISTS` for new tables
3. Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for new columns
4. Update the `expectedSchema` object in `scripts/check-database.js`
5. Run `npm run check-database` to apply the changes

## Upgrading the Application

When upgrading to a new version of the application:

1. Back up your database
2. Run `npm run check-database` to ensure your schema is up to date
3. Follow the application's upgrade instructions

## Troubleshooting API Keys Storage

The application uses a dual storage system for API keys:
- Encrypted in the database (in the `ai_providers` structure)
- Locally cached in localStorage for performance

If you're having issues with API keys:

1. Check the browser console for any storage-related errors
2. Run `npm run check-database` to verify the database structure
3. Run `npm run migrate-api-keys` to ensure keys are in the correct format
4. If problems persist, try clearing browser storage and logging in again 
# Supabase Credentials Update Guide

This guide will help you update your Supabase credentials for the ChatBuddy app.

## New Credentials

The project has been updated to use the following Supabase credentials:

- **Project URL**: `https://gphdrsfbypnckxbdjjap.supabase.co`
- **Anon Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDAwMjIsImV4cCI6MjA1OTE3NjAyMn0.skYsz1EJGdRwo5RW6HLljpy-D2KcQmBPJHYXb7MeyJw`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYwMDAyMiwiZXhwIjoyMDU5MTc2MDIyfQ.7gLACC4EsPkvDI2IbwGjeftBu5KwYfzujBT5KzEL6sQ`

## Automatic Update

To automatically update your Supabase credentials, run:

```bash
npm run setup-supabase
```

This script will:
1. Create or update your `.env.local` file with the new credentials
2. Preserve any other environment variables you may have set

## Manual Update

If you prefer to update manually, create or edit your `.env.local` file and add the following lines:

```
NEXT_PUBLIC_SUPABASE_URL=https://gphdrsfbypnckxbdjjap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDAwMjIsImV4cCI6MjA1OTE3NjAyMn0.skYsz1EJGdRwo5RW6HLljpy-D2KcQmBPJHYXb7MeyJw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaGRyc2ZieXBuY2t4YmRqamFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYwMDAyMiwiZXhwIjoyMDU5MTc2MDIyfQ.7gLACC4EsPkvDI2IbwGjeftBu5KwYfzujBT5KzEL6sQ
```

## Verify Setup

After updating your credentials, verify your Supabase connection:

```bash
node verify-supabase.js
```

If successful, you should see confirmation that the connection was established.

## Database Migration Tasks

If you need to run database migrations or fixes:

```bash
# Check database schema and structure
npm run check-database

# Fix any issues with the ai_providers column
npm run fix-ai-providers

# Migrate API keys to the new structure
npm run migrate-api-keys
```

## Troubleshooting

If you encounter any issues:

1. **Connection Errors**: Ensure your credentials are correctly copied without any whitespace
2. **Schema Errors**: Run the database check and fix scripts
3. **Permission Errors**: Verify you have the correct permissions in Supabase
4. **Column Missing**: The `fix-ai-providers` script will add the required column 
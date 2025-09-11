# Supabase Integration Setup Guide

This guide walks you through setting up Supabase for your ChatBuddy application.

## Prerequisites

1. A Supabase account (sign up at [https://supabase.com](https://supabase.com))
2. Node.js installed on your local machine
3. This ChatBuddy application codebase

## Step 1: Create a Supabase Project

1. Log in to your Supabase account
2. Click "New Project"
3. Choose a name for your project (e.g., "chatbuddy")
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

## Step 2: Set Up Authentication

1. In your Supabase dashboard, go to "Authentication" -> "Settings"
2. Under "Email Auth", ensure it's enabled
3. Configure any additional settings as needed:
   - Customize email templates
   - Set up password policies
   - Configure authentication settings as needed

## Step 3: Set Up Database Schema

1. Go to "SQL Editor" in your Supabase dashboard
2. Copy the entire content of the `supabase_schema.sql` file in this repository
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL and create all necessary tables and policies

## Step 4: Configure Environment Variables

1. In your Supabase project dashboard, go to "Settings" -> "API"
2. Copy your:
   - Project URL (labeled as "URL")
   - Anon/Public key (labeled as "anon key")
   - Service Role key (labeled as "service_role key")
3. Open the `.env.local` file in your project and update:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Never expose your `SUPABASE_SERVICE_ROLE_KEY` to the client. This key should only be used in secure server-side contexts.

## Step 5: Test Your Setup

1. Start your application with `npm run dev`
2. Navigate to `/auth/signup` to create a new account
3. Verify the account is created in your Supabase dashboard under "Authentication" -> "Users"

## Features Implemented with Supabase

### 1. User Authentication
- Sign up with email and password
- Secure user authentication
- Sign in with email and password
- Password reset functionality

### 2. User Preferences Storage
- Theme preferences
- Language settings
- Encrypted API key storage

### 3. Chat History Management
- Create, read, update, and delete chats
- Store and retrieve messages for each chat
- Associate chats with authenticated users

### 4. API Key Encryption
- Securely store API keys for different providers
- Client-side encryption and decryption of keys

### 5. Data Export
- Export all user data as JSON
- Download chat history

### 6. Automatic Chat Backup
- Scheduled backups of user chats
- Backup rotation and cleanup
- Option to restore from backups

## Security Considerations

1. **Row Level Security (RLS)**: All tables use RLS to ensure users can only access their own data
2. **API Key Encryption**: API keys are encrypted before being stored
3. **Service Role Usage**: The service role key is only used for admin operations
4. **Data Validation**: Input validation is performed on both client and server
5. **SQL Injection Prevention**: Using Supabase's parameterized queries for all database operations

## Troubleshooting

### Authentication Issues
- Verify your Supabase URL and anon key are correctly set
- Check browser console for errors
- Ensure authentication flow is working correctly

### Database Issues
- Check RLS policies are correctly applied
- Verify the schema was created correctly
- Look for any failed migrations in Supabase dashboard

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Encryption Best Practices](https://supabase.com/docs/guides/database/encrypting-data) 
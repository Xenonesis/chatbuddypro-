# Signup Error Fix Guide

## Error Description
**Error**: `AuthApiError: Database error saving new user`  
**Status**: 500 (Internal Server Error)  
**Location**: During user signup at `AuthContext.tsx:241`

---

## Root Cause

When a new user signs up via `supabase.auth.signUp()`, a database trigger attempts to automatically create a record in the `notification_preferences` table. However:

1. **The table doesn't exist** - Migration `004_add_push_notifications.sql` hasn't been run
2. **The trigger fails** - Causing the entire user creation transaction to rollback
3. **Signup fails with 500 error** - User cannot create an account

### Technical Details

```sql
-- This trigger fires AFTER INSERT on auth.users
CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();
```

If `create_default_notification_preferences()` fails (because the table doesn't exist or has permission issues), the entire signup transaction fails.

---

## Solution Options

### ✅ Solution 1: Run Complete Database Migration (Recommended)

**Best for**: Setting up the complete database schema properly

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the fix script**
   - Open `scripts/fix-signup-error.sql` from this repository
   - Copy the ENTIRE contents
   - Paste into Supabase SQL Editor
   - Click **Run**

3. **Verify the fix**
   - Try signing up a new user
   - The error should be resolved

**What it does**:
- Creates all missing tables (`notification_preferences`, `user_profiles`, `user_preferences`, etc.)
- Sets up Row Level Security (RLS) policies
- Creates the trigger function with proper error handling
- Grants necessary permissions

---

### 🔧 Solution 2: Quick Fix - Disable Trigger Temporarily

**Best for**: Quick testing when push notifications aren't needed immediately

Run this SQL in your Supabase SQL Editor:

```sql
-- Temporarily disable the problematic trigger
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON auth.users;

-- You can re-enable it later after running the full migration
```

**Pros**:
- Quick fix
- Allows signups to work immediately

**Cons**:
- Notification preferences won't be created for new users
- You'll need to run the full migration eventually

---

### 🛠️ Solution 3: Minimal Table Creation

**Best for**: Creating only what's needed to fix signup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create only the notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    chat_messages BOOLEAN DEFAULT true,
    system_updates BOOLEAN DEFAULT true,
    security_alerts BOOLEAN DEFAULT true,
    marketing BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notification preferences" 
ON notification_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" 
ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" 
ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Create the trigger function with error handling
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create notification preferences: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON auth.users;
CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();
```

---

## Verification Steps

After applying any solution, verify that signup works:

### 1. Check Database Setup

Run this in Supabase SQL Editor:

```sql
-- Check if notification_preferences table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notification_preferences'
);

-- Check if trigger exists
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'create_notification_preferences_trigger';
```

### 2. Test Signup Flow

1. Open your application
2. Navigate to `/auth/signup`
3. Try creating a new account with:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. **Expected Result**: Account created successfully, redirected to dashboard

### 3. Check Browser Console

- Should see: `Signup successful: {user data}`
- Should NOT see: `Signup error: AuthApiError: Database error saving new user`

### 4. Verify in Supabase Dashboard

1. Go to **Authentication** → **Users**
2. You should see the newly created user
3. Go to **Table Editor** → `notification_preferences`
4. You should see a record for the new user

---

## Additional Debugging

If signup still fails after applying the fix:

### 1. Check Supabase Logs

- Go to **Logs** → **Postgres Logs** in Supabase Dashboard
- Look for error messages during signup attempt
- Common issues:
  - Permission denied
  - Foreign key constraint violations
  - Missing tables

### 2. Check RLS Policies

```sql
-- View all policies for notification_preferences
SELECT * FROM pg_policies WHERE tablename = 'notification_preferences';
```

### 3. Test Trigger Function Manually

```sql
-- Test if the function works
SELECT create_default_notification_preferences();
```

### 4. Check User Creation

```sql
-- See if users are being created in auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

---

## Related Files

- **Fix Script**: `scripts/fix-signup-error.sql`
- **Signup Logic**: `src/contexts/AuthContext.tsx` (line 238-260)
- **Signup Page**: `src/app/auth/signup/page.tsx`
- **Migration**: `db/migrations/004_add_push_notifications.sql`
- **Database Schema**: `fix_database_issues.sql`

---

## Prevention

To prevent this issue in the future:

1. **Always run migrations** when setting up a new Supabase project
2. **Use error handling** in trigger functions (add EXCEPTION blocks)
3. **Test signup flow** after any database changes
4. **Monitor Supabase logs** for trigger failures
5. **Document migration order** so team members run them correctly

---

## FAQs

### Q: Will this affect existing users?
**A**: No, existing users are unaffected. The fix only ensures new signups work correctly.

### Q: Do I lose data when running these scripts?
**A**: No, these scripts use `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT` clauses to safely handle existing data.

### Q: Can I run the fix script multiple times?
**A**: Yes, it's idempotent and safe to run multiple times.

### Q: What if I already disabled the trigger?
**A**: Run Solution 1 to properly set up the complete schema, which will re-enable the trigger with proper error handling.

### Q: Why does the trigger have SECURITY DEFINER?
**A**: This allows the trigger to insert into `notification_preferences` even when RLS policies would normally block the insert, since the trigger runs with elevated privileges.

---

## Need More Help?

If you're still experiencing issues:

1. Check the **Browser Console** for detailed error messages
2. Check **Supabase Logs** (Dashboard → Logs → Postgres Logs)
3. Run the database health check: `node scripts/check-database.js`
4. Review the complete database setup guide: `SUPABASE_SETUP.md`

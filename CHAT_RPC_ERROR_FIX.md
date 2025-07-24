# Chat RPC Error Fix

## Problem Description

The application was encountering an error when trying to save chats:

```
Error: Error saving chat with RPC: {}
```

This error occurred in the `saveChatWithUserInfo` function in `userService.ts` at line 1018.

## Root Cause Analysis

The issue had multiple components:

### 1. Missing RPC Function
- The code was calling `save_chat_with_user_info` RPC function
- This function didn't exist in the database schema
- The RPC call was failing, triggering the fallback code

### 2. Missing Database Columns
- The fallback code tried to insert `user_email` and `user_name` into the `chats` table
- These columns didn't exist in the current database schema
- This caused the fallback to also fail

### 3. Poor Error Handling
- Error objects were being logged directly without proper serialization
- This resulted in empty `{}` error messages that weren't helpful for debugging

## Solution Implemented

### 1. Fixed Error Handling
Updated `userService.ts` to properly serialize error objects before logging:

```javascript
// Create safe error object for logging
const safeError = error instanceof Error 
  ? { message: error.message, name: error.name, code: (error as any).code } 
  : { message: String(error), code: (error as any)?.code };
console.error('Error saving chat with RPC:', JSON.stringify(safeError));
```

### 2. Updated Database Schema
Added missing columns to the `chats` table:
- `user_email TEXT`
- `user_name TEXT`

### 3. Created Missing RPC Function
Added the `save_chat_with_user_info` function to the database:

```sql
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
  INSERT INTO chats (
    user_id, title, model, user_email, user_name, created_at, updated_at
  ) VALUES (
    p_user_id, p_title, p_model, p_user_email, p_user_name, NOW(), NOW()
  )
  RETURNING id INTO v_chat_id;
  
  RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Files Modified

1. **src/lib/services/userService.ts**
   - Improved error handling with proper serialization
   - Maintained RPC call with proper fallback

2. **supabase_schema.sql**
   - Added `user_email` and `user_name` columns to `chats` table
   - Added `save_chat_with_user_info` RPC function

3. **add-chat-user-info-columns.sql** (new)
   - Migration script to add missing columns and function

4. **scripts/fix-chat-rpc-error.js** (new)
   - Automated script to apply the database migration

5. **package.json**
   - Added `fix-chat-rpc` script

## How to Apply the Fix

### Option 1: Run the Automated Script
```bash
npm run fix-chat-rpc
```

### Option 2: Manual Database Update
1. Open Supabase SQL Editor
2. Run the contents of `add-chat-user-info-columns.sql`

## Verification

After applying the fix:
1. The RPC error should no longer occur
2. Chats should be created successfully
3. User email and name will be stored with each chat
4. Error messages will be more descriptive if issues occur

## Prevention

To prevent similar issues in the future:
1. Always ensure RPC functions exist before calling them
2. Verify database schema matches the application code
3. Use proper error serialization for logging
4. Test database operations thoroughly

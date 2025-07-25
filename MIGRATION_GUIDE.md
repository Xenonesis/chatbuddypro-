# Chat Persistence Migration Guide

## 🚀 Quick Start

Since the automatic migration script encountered issues with the `run_sql` function, we'll run the migration manually through the Supabase dashboard. This is actually safer and gives you more control.

## 📋 Step-by-Step Migration Process

### Step 1: Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Migration SQL
1. Copy the contents of `scripts/manual-migration-sql.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

**Alternative**: You can run the SQL in smaller chunks if you prefer:

#### Chunk 1: Add Columns
```sql
-- Add missing columns to chats table
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add missing columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS message_order INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
```

#### Chunk 2: Create Indexes
```sql
-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id_updated_at ON chats(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_user_id_last_message_at ON chats(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_user_id_archived ON chats(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_chats_tags ON chats USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_order ON chat_messages(chat_id, message_order);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_created_at ON chat_messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_created_at ON chat_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_metadata ON chat_messages USING GIN(metadata);
```

#### Chunk 3: Create Functions and Triggers
```sql
-- Function to automatically update message_count and last_message_at
CREATE OR REPLACE FUNCTION update_chat_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats 
  SET 
    message_count = (
      SELECT COUNT(*) 
      FROM chat_messages 
      WHERE chat_id = NEW.chat_id
    ),
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update chat metadata
DROP TRIGGER IF EXISTS trigger_update_chat_metadata ON chat_messages;
CREATE TRIGGER trigger_update_chat_metadata
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_metadata();

-- Function to automatically set message_order
CREATE OR REPLACE FUNCTION set_message_order()
RETURNS TRIGGER AS $$
BEGIN
  NEW.message_order = COALESCE(
    (SELECT MAX(message_order) + 1 FROM chat_messages WHERE chat_id = NEW.chat_id),
    1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set message order
DROP TRIGGER IF EXISTS trigger_set_message_order ON chat_messages;
CREATE TRIGGER trigger_set_message_order
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_order();
```

#### Chunk 4: Update Existing Data
```sql
-- Update existing chats to populate new fields
UPDATE chats 
SET 
  message_count = (
    SELECT COUNT(*) 
    FROM chat_messages 
    WHERE chat_id = chats.id
  ),
  last_message_at = (
    SELECT MAX(created_at) 
    FROM chat_messages 
    WHERE chat_id = chats.id
  )
WHERE message_count IS NULL OR last_message_at IS NULL;

-- Update existing messages to set message_order
WITH ordered_messages AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY created_at) as order_num
  FROM chat_messages 
  WHERE message_order IS NULL
)
UPDATE chat_messages 
SET message_order = ordered_messages.order_num
FROM ordered_messages 
WHERE chat_messages.id = ordered_messages.id;
```

### Step 3: Verify Migration
Run the verification script to ensure everything worked correctly:

```bash
node scripts/verify-migration.js
```

You should see output like:
```
🔍 Verifying chat schema migration...

📋 Checking chats table structure...
✅ All expected columns found in chats table

📋 Checking chat_messages table structure...
✅ All expected columns found in chat_messages table

🧪 Testing basic functionality...
✅ Chats table accessible
✅ Chat messages table accessible

📊 Migration verification summary:
🎉 Migration verification PASSED!
✅ All required columns are present
✅ Tables are accessible
✅ Chat persistence system is ready to use
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "Column already exists" errors
**Solution**: This is normal and expected. The `IF NOT EXISTS` clauses handle this gracefully.

#### Issue: Permission denied errors
**Solution**: Make sure you're using the service role key and have proper permissions in Supabase.

#### Issue: Function creation fails
**Solution**: Ensure you have the necessary permissions to create functions. You might need to run these as a superuser.

#### Issue: Trigger creation fails
**Solution**: Drop existing triggers first, then recreate them.

### Verification Queries

You can run these queries in the SQL Editor to manually verify the migration:

```sql
-- Check chats table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chats' 
ORDER BY ordinal_position;

-- Check chat_messages table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('chats', 'chat_messages');

-- Test the new columns
SELECT id, title, message_count, is_archived, tags, last_message_at 
FROM chats 
LIMIT 5;

SELECT id, chat_id, message_order, metadata 
FROM chat_messages 
LIMIT 5;
```

## ✅ Post-Migration Testing

After running the migration, test these features in your application:

1. **Create a new chat** - Verify it appears in the database
2. **Send messages** - Check that message_order is set automatically
3. **Load chat history** - Ensure previous chats load correctly
4. **Use the enhanced dashboard** - Test search, filtering, and management features
5. **Try bulk operations** - Test selecting and managing multiple chats

## 🎯 Success Indicators

You'll know the migration was successful when:

- ✅ No errors in the verification script
- ✅ New chats are created with all metadata
- ✅ Messages are saved with proper ordering
- ✅ The enhanced chat history dashboard works
- ✅ Chat management features (rename, tag, archive) work
- ✅ Search and filtering work correctly

## 📞 Need Help?

If you encounter any issues:

1. Check the Supabase logs in your dashboard
2. Run the verification script to identify specific problems
3. Try running the migration in smaller chunks
4. Ensure your database permissions are correct

The chat persistence system is now ready to provide an excellent user experience with robust data management!

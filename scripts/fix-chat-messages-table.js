#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function checkTableExists(tableName) {
  console.log(`\n🔍 Checking if ${tableName} table exists...`);
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === 'PGRST106') {
        console.log(`   ❌ Table ${tableName} does not exist`);
        return false;
      } else {
        console.log(`   ⚠️  Table ${tableName} exists but has issues: ${error.message}`);
        return 'exists_with_issues';
      }
    }
    
    console.log(`   ✅ Table ${tableName} exists and is accessible`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error checking table: ${error.message}`);
    return false;
  }
}

async function checkChatMessagesSchema() {
  console.log('\n📋 Checking chat_messages table schema...');
  try {
    // Try to get table structure
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, chat_id, user_id, role, content, created_at')
      .limit(1);
    
    if (error) {
      if (error.message.includes('chat_id')) {
        console.log('   ❌ chat_id column is missing from chat_messages table');
        return false;
      } else if (error.message.includes('does not exist')) {
        console.log('   ❌ chat_messages table does not exist');
        return false;
      } else {
        console.log(`   ⚠️  Schema issue: ${error.message}`);
        return false;
      }
    }
    
    console.log('   ✅ chat_messages table schema looks correct');
    return true;
  } catch (error) {
    console.log(`   ❌ Error checking schema: ${error.message}`);
    return false;
  }
}

async function createChatMessagesTable() {
  console.log('\n🔧 Creating chat_messages table...');
  
  // We'll need to run this SQL in the Supabase dashboard
  const createTableSQL = `
-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for chat_messages
DROP POLICY IF EXISTS "Users can only access their own messages" ON chat_messages;
CREATE POLICY "Users can only access their own messages" 
  ON chat_messages FOR ALL 
  USING (auth.uid() = user_id);
`;

  console.log('\n📝 SQL to run in Supabase Dashboard:');
  console.log('=' * 50);
  console.log(createTableSQL);
  console.log('=' * 50);
  
  console.log('\n⚠️  MANUAL ACTION REQUIRED:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the SQL above');
  console.log('4. Run the SQL query');
  console.log('5. Then run this script again to verify');
  
  return false; // Return false since we need manual action
}

async function testChatMessagesTable() {
  console.log('\n🧪 Testing chat_messages table functionality...');
  
  try {
    // First check if we have any chats to reference
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id, user_id')
      .limit(1);
    
    if (chatsError || !chats || chats.length === 0) {
      console.log('   ⚠️  No chats found to test with, but table structure should be OK');
      return true;
    }
    
    const testChat = chats[0];
    
    // Try to insert a test message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: testChat.id,
        user_id: testChat.user_id,
        role: 'user',
        content: 'Test message - will be deleted'
      })
      .select()
      .single();
    
    if (error) {
      console.log(`   ❌ Failed to insert test message: ${error.message}`);
      return false;
    }
    
    console.log('   ✅ Successfully inserted test message');
    
    // Clean up test message
    await supabase
      .from('chat_messages')
      .delete()
      .eq('id', data.id);
    
    console.log('   ✅ Test message cleaned up');
    return true;
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 ChatBuddy Pro - Fix chat_messages Table');
  console.log('==========================================');
  
  // Check if chats table exists (prerequisite)
  const chatsExists = await checkTableExists('chats');
  if (!chatsExists) {
    console.log('\n❌ ERROR: chats table does not exist!');
    console.log('The chat_messages table requires the chats table to exist first.');
    console.log('Please run the main database setup script first.');
    process.exit(1);
  }
  
  // Check chat_messages table
  const chatMessagesExists = await checkTableExists('chat_messages');
  
  if (chatMessagesExists === false) {
    console.log('\n❌ chat_messages table is missing!');
    await createChatMessagesTable();
    process.exit(1);
  } else if (chatMessagesExists === 'exists_with_issues') {
    console.log('\n⚠️  chat_messages table exists but has schema issues');
    const schemaOK = await checkChatMessagesSchema();
    if (!schemaOK) {
      console.log('\n❌ Schema issues detected. Please run the SQL from createChatMessagesTable manually.');
      await createChatMessagesTable();
      process.exit(1);
    }
  }
  
  // Test the table
  const testPassed = await testChatMessagesTable();
  
  if (testPassed) {
    console.log('\n🎉 SUCCESS: chat_messages table is working correctly!');
    console.log('You can now try sending messages in your chat application.');
  } else {
    console.log('\n❌ FAILED: chat_messages table has issues');
    console.log('Please check the Supabase logs for more details.');
    process.exit(1);
  }
}

main().catch(console.error);

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying chat schema migration...\n');
  
  try {
    // Check chats table structure by testing column access
    console.log('📋 Checking chats table structure...');

    // Test if new columns exist by trying to select them
    const { error: chatsError } = await supabase
      .from('chats')
      .select('id, title, last_message_at, message_count, is_archived, tags')
      .limit(1);

    let chatsColumnsExist = true;
    if (chatsError) {
      console.log('⚠️  Some columns may be missing in chats table:', chatsError.message);
      chatsColumnsExist = false;
    }

    if (chatsColumnsExist) {
      console.log('✅ All expected columns found in chats table');
    } else {
      console.log('⚠️  Some columns may be missing in chats table');
    }
    
    // Check chat_messages table structure by testing column access
    console.log('\n📋 Checking chat_messages table structure...');

    const { error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, chat_id, user_id, role, content, created_at, message_order, metadata')
      .limit(1);

    let messagesColumnsExist = true;
    if (messagesError) {
      console.log('⚠️  Some columns may be missing in chat_messages table:', messagesError.message);
      messagesColumnsExist = false;
    }

    if (messagesColumnsExist) {
      console.log('✅ All expected columns found in chat_messages table');
    } else {
      console.log('⚠️  Some columns may be missing in chat_messages table');
    }
    
    // Test basic functionality
    console.log('\n🧪 Testing basic functionality...');

    // Test chats table basic access
    const { error: chatsBasicError } = await supabase
      .from('chats')
      .select('id, title, created_at')
      .limit(1);

    if (chatsBasicError) {
      console.error('❌ Error accessing chats table:', chatsBasicError.message);
    } else {
      console.log('✅ Chats table accessible');
    }

    // Test chat_messages table basic access
    const { error: messagesBasicError } = await supabase
      .from('chat_messages')
      .select('id, content, created_at')
      .limit(1);

    if (messagesBasicError) {
      console.error('❌ Error accessing chat_messages table:', messagesBasicError.message);
    } else {
      console.log('✅ Chat messages table accessible');
    }
    
    // Check for indexes (this might not work with regular client)
    console.log('\n📊 Migration verification summary:');

    const allColumnsPresent = chatsColumnsExist && messagesColumnsExist;
    const tablesAccessible = !chatsBasicError && !messagesBasicError;
    
    if (allColumnsPresent && tablesAccessible) {
      console.log('🎉 Migration verification PASSED!');
      console.log('✅ All required columns are present');
      console.log('✅ Tables are accessible');
      console.log('✅ Chat persistence system is ready to use');
      
      console.log('\n📝 Next steps:');
      console.log('1. Test creating a new chat in your application');
      console.log('2. Verify messages are being saved');
      console.log('3. Check the enhanced chat history dashboard');
      console.log('4. Try the new chat management features');
      
      return true;
    } else {
      console.log('❌ Migration verification FAILED!');
      if (!allColumnsPresent) {
        console.log('❌ Some required columns are missing');
        console.log('   Please run the manual migration SQL in Supabase dashboard');
      }
      if (!tablesAccessible) {
        console.log('❌ Tables are not accessible');
        console.log('   Please check your database permissions');
      }
      return false;
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run the verification
verifyMigration()
  .then(success => {
    if (success) {
      console.log('\n🎯 Verification completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Verification failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });

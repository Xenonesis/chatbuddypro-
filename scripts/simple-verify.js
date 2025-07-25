require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Simple verification script starting...');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('- Supabase URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
console.log('- Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simpleVerify() {
  try {
    console.log('\n🧪 Testing basic table access...');
    
    // Test chats table
    console.log('Testing chats table...');
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('id, title')
      .limit(1);
    
    if (chatsError) {
      console.log('❌ Chats table error:', chatsError.message);
    } else {
      console.log('✅ Chats table accessible');
      console.log('   Found', chats?.length || 0, 'chats');
    }
    
    // Test chat_messages table
    console.log('Testing chat_messages table...');
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, content')
      .limit(1);
    
    if (messagesError) {
      console.log('❌ Chat messages table error:', messagesError.message);
    } else {
      console.log('✅ Chat messages table accessible');
      console.log('   Found', messages?.length || 0, 'messages');
    }
    
    // Test new columns in chats table
    console.log('\nTesting new chats columns...');
    const { data: chatsNew, error: chatsNewError } = await supabase
      .from('chats')
      .select('id, last_message_at, message_count, is_archived, tags')
      .limit(1);
    
    if (chatsNewError) {
      console.log('❌ New chats columns error:', chatsNewError.message);
      console.log('   This means the migration hasn\'t been run yet');
    } else {
      console.log('✅ New chats columns accessible');
      if (chatsNew && chatsNew.length > 0) {
        console.log('   Sample data:', JSON.stringify(chatsNew[0], null, 2));
      }
    }
    
    // Test new columns in chat_messages table
    console.log('\nTesting new chat_messages columns...');
    const { data: messagesNew, error: messagesNewError } = await supabase
      .from('chat_messages')
      .select('id, message_order, metadata')
      .limit(1);
    
    if (messagesNewError) {
      console.log('❌ New chat_messages columns error:', messagesNewError.message);
      console.log('   This means the migration hasn\'t been run yet');
    } else {
      console.log('✅ New chat_messages columns accessible');
      if (messagesNew && messagesNew.length > 0) {
        console.log('   Sample data:', JSON.stringify(messagesNew[0], null, 2));
      }
    }
    
    // Summary
    console.log('\n📊 Summary:');
    const basicTablesWork = !chatsError && !messagesError;
    const newColumnsWork = !chatsNewError && !messagesNewError;
    
    if (basicTablesWork && newColumnsWork) {
      console.log('🎉 Migration appears to be COMPLETE!');
      console.log('✅ Basic tables work');
      console.log('✅ New columns work');
      console.log('✅ Chat persistence system is ready');
    } else if (basicTablesWork && !newColumnsWork) {
      console.log('⚠️  Migration is NEEDED');
      console.log('✅ Basic tables work');
      console.log('❌ New columns missing');
      console.log('📝 Please run the migration SQL in Supabase dashboard');
    } else {
      console.log('❌ Database issues detected');
      console.log('❌ Basic table access failed');
      console.log('🔧 Please check your database setup');
    }
    
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
    process.exit(1);
  }
}

simpleVerify()
  .then(() => {
    console.log('\n✅ Verification complete');
  })
  .catch(error => {
    console.error('💥 Error:', error);
    process.exit(1);
  });

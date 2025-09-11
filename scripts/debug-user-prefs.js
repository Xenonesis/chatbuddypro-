// Script to debug user preferences and API keys
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugUserPreferences() {
  try {
    console.log('Fetching user preferences...');
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('id, user_id, api_keys, ai_providers, preferences, created_at, updated_at')
      .eq('user_id', '6c32572f-d383-4b35-b394-3e34de353d01');
    
    if (error) {
      console.error('Error fetching preferences:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No preferences found for user');
      return;
    }
    
    console.log(`Found ${data.length} records for user:`);
    
    data.forEach((record, index) => {
      console.log(`\n=== Record ${index + 1} (ID: ${record.id}) ===`);
      console.log('Created:', record.created_at);
      console.log('Updated:', record.updated_at);
      
      console.log('\nAPI Keys structure:');
      console.log(JSON.stringify(record.api_keys, null, 2));
      
      console.log('\nAI Providers structure:');
      console.log(JSON.stringify(record.ai_providers, null, 2));
      
      console.log('\nPreferences structure:');
      console.log(JSON.stringify(record.preferences, null, 2));
    });
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

debugUserPreferences()
  .then(() => {
    console.log('\nDebug completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
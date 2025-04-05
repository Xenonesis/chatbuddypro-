// Test script for Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase Configuration:');
console.log('URL configured:', Boolean(supabaseUrl));
console.log('Anon Key configured:', Boolean(supabaseKey));
console.log('Service Key configured:', Boolean(serviceKey));

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

async function testSupabase() {
  console.log('Creating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Testing connection...');
    
    // Test connection to Supabase
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      console.error('Error connecting to Supabase:', versionError);
    } else {
      console.log('Connected to Supabase:', versionData);
    }
    
    // Try to list tables
    console.log('Checking user_preferences table...');
    const { data: tableData, error: tableError } = await supabase
      .from('user_preferences')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing user_preferences table:', tableError);
      
      // Try with service role key
      console.log('Trying with service role key...');
      const adminClient = createClient(supabaseUrl, serviceKey);
      
      const { data: adminData, error: adminError } = await adminClient
        .from('user_preferences')
        .select('id')
        .limit(1);
      
      if (adminError) {
        console.error('Error with service role too:', adminError);
      } else {
        console.log('Table accessible with service role:', adminData);
      }
    } else {
      console.log('Successfully queried user_preferences table:', tableData);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabase(); 
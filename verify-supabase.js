// Script to verify Supabase connection during build
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('---------- SUPABASE VERIFICATION ----------');
console.log('Supabase URL exists:', Boolean(supabaseUrl));
console.log('Supabase URL length:', supabaseUrl ? supabaseUrl.length : 0);
console.log('Supabase Anon Key exists:', Boolean(supabaseKey));
console.log('Supabase Anon Key length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials!');
  process.exit(1);
}

try {
  // Initialize the Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  console.log('Supabase client initialized successfully');
  console.log('---------- SUPABASE VERIFICATION COMPLETE ----------');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  process.exit(1);
} 
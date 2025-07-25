console.log('Starting basic test...');

try {
  require('dotenv').config({ path: '.env.local' });
  console.log('Environment loaded');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log('Supabase URL exists:', !!supabaseUrl);
  
  const { createClient } = require('@supabase/supabase-js');
  console.log('Supabase client imported');
  
  console.log('Test completed successfully');
} catch (error) {
  console.error('Error:', error.message);
}

console.log('Testing migration script...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

try {
  require('dotenv').config({ path: '.env.local' });
  console.log('Environment loaded successfully');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
  }
  
  console.log('Environment variables found');
  console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
  console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('Test completed successfully');

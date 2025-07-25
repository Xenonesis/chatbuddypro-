require('dotenv').config({ path: '.env.local' });

// Check required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Verifying Supabase configuration...');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  process.exit(1);
}

// Basic URL validation
try {
  new URL(supabaseUrl);
  console.log('✓ Supabase URL is valid');
} catch (error) {
  console.error('❌ Invalid Supabase URL format');
  process.exit(1);
}

// Basic key validation
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('❌ Invalid Supabase anon key format');
  process.exit(1);
}

console.log('✓ Supabase configuration verified successfully');
console.log('✓ Ready for deployment');
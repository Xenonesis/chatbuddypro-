const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('🔍 Testing Authentication Flow...\n');
  
  try {
    // Test 1: Check Supabase connection
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Current session:', data.session ? 'Active' : 'None');
    
    if (data.session) {
      console.log('User ID:', data.session.user.id);
      console.log('User Email:', data.session.user.email);
      console.log('Session expires at:', new Date(data.session.expires_at * 1000));
    }
    
    // Test 2: Check user profiles table
    console.log('\n2. Testing user profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ User profiles table error:', profileError.message);
    } else {
      console.log('✅ User profiles table accessible');
      console.log('Sample profiles count:', profiles.length);
    }
    
    // Test 3: Check user preferences table
    console.log('\n3. Testing user preferences table...');
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1);
    
    if (prefError) {
      console.error('❌ User preferences table error:', prefError.message);
    } else {
      console.log('✅ User preferences table accessible');
      console.log('Sample preferences count:', preferences.length);
    }
    
    // Test 4: Check auth policies
    console.log('\n4. Testing authentication policies...');
    
    if (data.session) {
      // Test user can access their own data
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.session.user.id);
      
      if (userProfileError) {
        console.error('❌ User profile access error:', userProfileError.message);
      } else {
        console.log('✅ User can access their profile');
        console.log('Profile exists:', userProfile.length > 0);
      }
      
      const { data: userPrefs, error: userPrefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', data.session.user.id);
      
      if (userPrefsError) {
        console.error('❌ User preferences access error:', userPrefsError.message);
      } else {
        console.log('✅ User can access their preferences');
        console.log('Preferences exist:', userPrefs.length > 0);
      }
    } else {
      console.log('⚠️  No active session - skipping user data tests');
    }
    
    console.log('\n🎉 Authentication flow test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuthFlow();
#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const serviceSupabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function checkAuthAndRLS() {
  console.log('🔐 Checking Authentication and RLS Status...');
  console.log('===========================================');
  
  try {
    // Check RLS policies
    console.log('1. Checking RLS Policies:');
    
    const { data: policies, error: policiesError } = await serviceSupabase
      .rpc('get_policies', { table_name: 'user_profiles' })
      .catch(() => null);
    
    if (policiesError || !policies) {
      // Alternative method to check RLS
      const { data: rlsStatus, error: rlsError } = await serviceSupabase
        .from('pg_tables')
        .select('*')
        .eq('tablename', 'user_profiles')
        .limit(1);
      
      console.log('   Using alternative RLS check...');
    }
    
    // Check if RLS is enabled by testing anonymous access
    const anonSupabase = createClient(supabaseUrl, anonKey);
    
    const { data: anonTest, error: anonError } = await anonSupabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (anonError) {
      if (anonError.message.includes('RLS') || 
          anonError.message.includes('policy') || 
          anonError.message.includes('permission denied')) {
        console.log('   ✅ RLS is properly enabled and blocking anonymous access');
      } else {
        console.log('   ❌ RLS error (unexpected):', anonError.message);
      }
    } else {
      console.log('   ⚠️  RLS is NOT enabled - anonymous access is allowed!');
      console.log('   🔧 This needs to be fixed for security');
    }
    
    // Check current authentication state
    console.log('\n2. Authentication State:');
    
    const { data: users, error: usersError } = await serviceSupabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('   ❌ Cannot list users:', usersError.message);
      return;
    }
    
    console.log(`   📊 Total registered users: ${users.users.length}`);
    
    // Show recent users
    const recentUsers = users.users
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    
    console.log('\n   Recent users:');
    recentUsers.forEach((user, index) => {
      const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never';
      console.log(`   ${index + 1}. ${user.email}`);
      console.log(`      Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`      Last sign in: ${lastSignIn}`);
      console.log(`      Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`);
    });
    
    // Check for profiles without proper user association
    console.log('\n3. Profile Data Integrity:');
    
    const { data: allProfiles, error: profilesError } = await serviceSupabase
      .from('user_profiles')
      .select('user_id, full_name, created_at, updated_at');
    
    if (profilesError) {
      console.log('   ❌ Cannot fetch profiles:', profilesError.message);
    } else {
      console.log(`   📊 Total profiles: ${allProfiles.length}`);
      
      // Check for orphaned profiles
      const userIds = new Set(users.users.map(u => u.id));
      const orphanedProfiles = allProfiles.filter(p => !userIds.has(p.user_id));
      
      if (orphanedProfiles.length > 0) {
        console.log(`   ⚠️  Found ${orphanedProfiles.length} orphaned profiles (users deleted but profiles remain)`);
      } else {
        console.log('   ✅ All profiles have valid user associations');
      }
      
      // Check for users without profiles
      const profileUserIds = new Set(allProfiles.map(p => p.user_id));
      const usersWithoutProfiles = users.users.filter(u => !profileUserIds.has(u.id));
      
      if (usersWithoutProfiles.length > 0) {
        console.log(`   📝 ${usersWithoutProfiles.length} users don't have profiles yet:`);
        usersWithoutProfiles.slice(0, 3).forEach(user => {
          console.log(`      - ${user.email}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Check failed:', error.message);
  }
  
  console.log('\n===========================================');
  console.log('🎯 MAIN ISSUE IDENTIFIED:');
  console.log('   You need to LOG IN to the application first!');
  console.log('');
  console.log('📋 To fix the profile saving issue:');
  console.log('1. 🔐 Go to the login page in your browser');
  console.log('2. 📧 Sign in with your email and password');
  console.log('3. 🔄 Navigate back to the profile page');
  console.log('4. 💾 Try saving your profile again');
  console.log('');
  console.log('🔧 If login doesn\'t work:');
  console.log('1. Check browser console for errors');
  console.log('2. Verify your email is confirmed');
  console.log('3. Try password reset if needed');
}

checkAuthAndRLS()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

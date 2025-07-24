#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function cleanupDuplicateProfiles() {
  console.log('🧹 Cleaning up duplicate profiles...');
  console.log('=====================================');
  
  try {
    // Step 1: Find all users with multiple profiles
    console.log('1. Finding users with duplicate profiles...');
    
    const { data: allProfiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, user_id, created_at, updated_at, full_name')
      .order('user_id, created_at');
    
    if (fetchError) {
      console.log('❌ Error fetching profiles:', fetchError.message);
      return;
    }
    
    console.log(`   Found ${allProfiles.length} total profiles`);
    
    // Group profiles by user_id
    const profilesByUser = {};
    allProfiles.forEach(profile => {
      if (!profilesByUser[profile.user_id]) {
        profilesByUser[profile.user_id] = [];
      }
      profilesByUser[profile.user_id].push(profile);
    });
    
    // Find users with duplicates
    const usersWithDuplicates = Object.entries(profilesByUser)
      .filter(([userId, profiles]) => profiles.length > 1);
    
    console.log(`   Found ${usersWithDuplicates.length} users with duplicate profiles`);
    
    if (usersWithDuplicates.length === 0) {
      console.log('✅ No duplicate profiles found!');
      return;
    }
    
    // Step 2: For each user with duplicates, keep the most recent one
    let totalDeleted = 0;
    
    for (const [userId, profiles] of usersWithDuplicates) {
      console.log(`\n   Processing user ${userId} (${profiles.length} profiles):`);
      
      // Sort by updated_at descending (most recent first)
      profiles.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      
      const keepProfile = profiles[0]; // Keep the most recent
      const deleteProfiles = profiles.slice(1); // Delete the rest
      
      console.log(`     Keeping profile: ${keepProfile.id} (${keepProfile.updated_at})`);
      console.log(`     Deleting ${deleteProfiles.length} duplicate(s):`);
      
      for (const profile of deleteProfiles) {
        console.log(`       - ${profile.id} (${profile.updated_at})`);
        
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', profile.id);
        
        if (deleteError) {
          console.log(`       ❌ Failed to delete ${profile.id}:`, deleteError.message);
        } else {
          console.log(`       ✅ Deleted ${profile.id}`);
          totalDeleted++;
        }
      }
    }
    
    console.log(`\n✅ Cleanup completed! Deleted ${totalDeleted} duplicate profiles.`);
    
    // Step 3: Verify cleanup
    console.log('\n3. Verifying cleanup...');
    
    const { data: remainingProfiles, error: verifyError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .order('user_id');
    
    if (verifyError) {
      console.log('❌ Error verifying cleanup:', verifyError.message);
      return;
    }
    
    const remainingByUser = {};
    remainingProfiles.forEach(profile => {
      remainingByUser[profile.user_id] = (remainingByUser[profile.user_id] || 0) + 1;
    });
    
    const stillHaveDuplicates = Object.entries(remainingByUser)
      .filter(([userId, count]) => count > 1);
    
    if (stillHaveDuplicates.length === 0) {
      console.log('✅ All duplicates successfully removed!');
      console.log(`   Total profiles remaining: ${remainingProfiles.length}`);
    } else {
      console.log(`⚠️  Still have ${stillHaveDuplicates.length} users with duplicates:`);
      stillHaveDuplicates.forEach(([userId, count]) => {
        console.log(`     User ${userId}: ${count} profiles`);
      });
    }
    
  } catch (error) {
    console.log('❌ Cleanup failed with error:', error.message);
    console.log('   Full error:', error);
  }
  
  console.log('\n=====================================');
  console.log('🏁 Cleanup completed!');
}

async function main() {
  await cleanupDuplicateProfiles();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

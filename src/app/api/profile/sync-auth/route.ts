import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client for server-side operations - lazy initialization
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing required Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, profile } = await request.json();

    if (!userId || !profile) {
      return NextResponse.json(
        { error: 'Missing userId or profile data' },
        { status: 400 }
      );
    }

    console.log('Syncing profile to auth metadata for user:', userId);

    // Prepare metadata object with profile information
    const userMetadata = {
      full_name: profile.full_name || '',
      age: profile.age,
      gender: profile.gender,
      profession: profile.profession,
      organization_name: profile.organization_name,
      mobile_number: profile.mobile_number,
      profile_updated_at: profile.updated_at,
      // Keep existing metadata and add profile data
      profile_complete: !!(profile.full_name && (profile.age || profile.gender || profile.profession))
    };

    // Update user metadata using admin client
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: userMetadata
    });

    if (error) {
      console.error('Error updating auth user metadata:', error);
      return NextResponse.json(
        { error: 'Failed to sync profile to auth metadata', details: error.message },
        { status: 500 }
      );
    }

    console.log('Successfully synced profile to auth metadata - data should now be visible in Supabase dashboard');

    return NextResponse.json({ 
      success: true, 
      message: 'Profile synced to auth metadata successfully' 
    });

  } catch (error) {
    console.error('Exception in profile sync API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

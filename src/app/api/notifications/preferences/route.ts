import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's notification preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // If no preferences exist, return defaults
    if (!preferences) {
      const defaultPreferences = {
        push_enabled: true,
        email_enabled: true,
        chat_messages: true,
        system_updates: true,
        security_alerts: true,
        marketing: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'UTC'
      };

      return NextResponse.json({
        success: true,
        preferences: defaultPreferences
      });
    }

    return NextResponse.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error('Error in notification preferences GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      push_enabled,
      email_enabled,
      chat_messages,
      system_updates,
      security_alerts,
      marketing,
      quiet_hours_start,
      quiet_hours_end,
      timezone
    } = body;

    // Update or create notification preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        push_enabled: push_enabled ?? true,
        email_enabled: email_enabled ?? true,
        chat_messages: chat_messages ?? true,
        system_updates: system_updates ?? true,
        security_alerts: security_alerts ?? true,
        marketing: marketing ?? false,
        quiet_hours_start: quiet_hours_start || '22:00',
        quiet_hours_end: quiet_hours_end || '08:00',
        timezone: timezone || 'UTC',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error('Error in notification preferences PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
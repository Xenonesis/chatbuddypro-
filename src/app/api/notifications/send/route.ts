import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@chatbuddy.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the authenticated user (for admin/system notifications)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      targetUserId, 
      title, 
      message, 
      category = 'system',
      data = {},
      scheduleFor 
    } = body;

    if (!targetUserId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if we should send notification based on user preferences
    const { data: shouldSend } = await supabase
      .rpc('should_send_notification', {
        p_user_id: targetUserId,
        p_category: category,
        p_type: 'push'
      });

    if (!shouldSend) {
      return NextResponse.json({
        success: true,
        message: 'Notification blocked by user preferences'
      });
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'push',
        category,
        title,
        body: message,
        data,
        scheduled_for: scheduleFor || new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    // If not scheduled for later, send immediately
    if (!scheduleFor || new Date(scheduleFor) <= new Date()) {
      await sendPushNotification(supabase, notification);
    }

    return NextResponse.json({
      success: true,
      notificationId: notification.id
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendPushNotification(supabase: any, notification: any) {
  try {
    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', notification.user_id)
      .eq('is_active', true);

    if (error || !subscriptions?.length) {
      console.log('No active push subscriptions found for user:', notification.user_id);
      
      // Update notification status
      await supabase
        .from('notifications')
        .update({
          status: 'failed',
          error_message: 'No active push subscriptions',
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);
      
      return;
    }

    const payload = {
      title: notification.title,
      body: notification.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `notification-${notification.id}`,
      data: {
        notificationId: notification.id,
        url: notification.data?.url || '/chat',
        category: notification.category,
        timestamp: Date.now(),
        ...notification.data
      },
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/icon-192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: notification.category === 'security'
    };

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.subscription_data.endpoint,
            keys: sub.subscription_data.keys
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );

          return { success: true, subscriptionId: sub.id };
        } catch (error: any) {
          console.error('Failed to send to subscription:', sub.id, error);
          
          // If subscription is invalid, mark it as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id);
          }

          return { success: false, subscriptionId: sub.id, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failureCount = results.length - successCount;

    // Update notification status
    await supabase
      .from('notifications')
      .update({
        status: successCount > 0 ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
        error_message: failureCount > 0 ? `${failureCount} subscriptions failed` : null
      })
      .eq('id', notification.id);

    console.log(`Notification sent: ${successCount} success, ${failureCount} failed`);

  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    
    // Update notification status
    await supabase
      .from('notifications')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        sent_at: new Date().toISOString()
      })
      .eq('id', notification.id);
  }
}
// Real notification service to replace demo notifications
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'push' | 'email' | 'in_app';
  category: 'chat' | 'system' | 'security' | 'marketing';
  title: string;
  body: string;
  data: any;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduled_for: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

class NotificationService {
  // Get user's notifications
  async getUserNotifications(limit = 20, offset = 0): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get notifications
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Get total count
      const { count: total } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      return {
        notifications: notifications || [],
        total: total || 0,
        unreadCount: unreadCount || 0
      };

    } catch (error) {
      console.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          status: 'read'
        })
        .eq('user_id', user.id)
        .is('read_at', null);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Send notification to user
  async sendNotification(params: {
    targetUserId: string;
    title: string;
    message: string;
    category?: string;
    data?: any;
    scheduleFor?: string;
  }): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send notification');
      }

    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    const { data: { user } } = supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot subscribe to notifications: user not authenticated');
      return null;
    }

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return subscription;
  }

  // Get notification categories with icons
  getNotificationCategories() {
    return {
      chat: {
        label: 'Chat Messages',
        icon: 'MessageSquare',
        color: 'blue'
      },
      system: {
        label: 'System Updates',
        icon: 'Settings',
        color: 'green'
      },
      security: {
        label: 'Security Alerts',
        icon: 'Shield',
        color: 'red'
      },
      marketing: {
        label: 'Marketing',
        icon: 'Mail',
        color: 'purple'
      }
    };
  }

  // Format notification for display
  formatNotification(notification: Notification) {
    const categories = this.getNotificationCategories();
    const category = categories[notification.category as keyof typeof categories];
    
    return {
      ...notification,
      categoryInfo: category,
      isUnread: !notification.read_at,
      timeAgo: this.getTimeAgo(notification.created_at),
      formattedDate: new Date(notification.created_at).toLocaleDateString()
    };
  }

  // Helper function to get time ago
  private getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const notificationService = new NotificationService();
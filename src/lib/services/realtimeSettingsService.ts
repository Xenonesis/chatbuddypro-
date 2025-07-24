'use client';

import { supabase } from '@/lib/supabase';
import { ModelSettings } from '@/lib/context/ModelSettingsContext';

export interface RealtimeSettingsService {
  subscribeToSettingsChanges: (
    userId: string,
    onUpdate: (settings: any) => void
  ) => () => void;
  updateSettingsRealtime: (userId: string, settings: Partial<ModelSettings>) => Promise<boolean>;
  getLatestSettings: (userId: string) => Promise<any>;
}

class RealtimeSettingsServiceImpl implements RealtimeSettingsService {
  private subscriptions = new Map<string, any>();

  subscribeToSettingsChanges(
    userId: string,
    onUpdate: (settings: any) => void
  ): () => void {
    // Clean up existing subscription for this user
    this.unsubscribeUser(userId);

    console.log(`Setting up real-time subscription for user: ${userId}`);

    const channel = supabase
      .channel(`settings-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time settings update received:', payload);
          
          if (payload.new) {
            onUpdate({
              preferences: payload.new.preferences,
              api_keys: payload.new.api_keys,
              ai_providers: payload.new.ai_providers,
              theme: payload.new.theme,
              language: payload.new.language,
              updated_at: payload.new.updated_at
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time settings insert received:', payload);
          
          if (payload.new) {
            onUpdate({
              preferences: payload.new.preferences,
              api_keys: payload.new.api_keys,
              ai_providers: payload.new.ai_providers,
              theme: payload.new.theme,
              language: payload.new.language,
              updated_at: payload.new.updated_at
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${userId}:`, status);
      });

    // Store subscription for cleanup
    this.subscriptions.set(userId, channel);

    // Return cleanup function
    return () => this.unsubscribeUser(userId);
  }

  private unsubscribeUser(userId: string): void {
    const existingChannel = this.subscriptions.get(userId);
    if (existingChannel) {
      console.log(`Cleaning up real-time subscription for user: ${userId}`);
      existingChannel.unsubscribe();
      this.subscriptions.delete(userId);
    }
  }

  async updateSettingsRealtime(
    userId: string, 
    settings: Partial<ModelSettings>
  ): Promise<boolean> {
    try {
      console.log('Updating settings in real-time for user:', userId);
      
      // Use the database function for secure updates
      const { data, error } = await supabase.rpc('update_user_settings', {
        p_user_id: userId,
        p_settings: settings
      });

      if (error) {
        console.error('Error updating settings in real-time:', error);
        return false;
      }

      console.log('Settings updated successfully in real-time');
      return data === true;
    } catch (error) {
      console.error('Exception updating settings in real-time:', error);
      return false;
    }
  }

  async getLatestSettings(userId: string): Promise<any> {
    try {
      console.log('Fetching latest settings for user:', userId);
      
      const { data, error } = await supabase.rpc('get_user_settings', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching latest settings:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Exception fetching latest settings:', error);
      return null;
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    console.log('Cleaning up all real-time subscriptions');
    this.subscriptions.forEach((channel, userId) => {
      this.unsubscribeUser(userId);
    });
  }
}

// Export singleton instance
export const realtimeSettingsService = new RealtimeSettingsServiceImpl();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeSettingsService.cleanup();
  });
}
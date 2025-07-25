import { supabase } from '@/lib/supabase';

export type ChatMode = 'thoughtful' | 'quick' | 'creative' | 'technical' | 'learning';
export type ViewMode = 'grid' | 'list' | 'sidebar';

export interface ChatSettings {
  chatMode: ChatMode;
  showThinking: boolean;
  showPreview: boolean;
  viewMode: ViewMode;
}

export interface ChatSettingsWithTimestamps extends ChatSettings {
  createdAt: string;
  updatedAt: string;
}

class ChatSettingsService {
  /**
   * Get chat settings for a user from user_preferences table
   */
  async getChatSettings(userId: string): Promise<ChatSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, return defaults
          return {
            chatMode: 'thoughtful',
            showThinking: false,
            showPreview: false,
            viewMode: 'grid'
          };
        }
        throw error;
      }

      // Extract chat settings from preferences
      const preferences = data.preferences || {};
      const chatSettings = preferences.chatSettings || {};

      return {
        chatMode: (chatSettings.chatMode as ChatMode) || 'thoughtful',
        showThinking: chatSettings.showThinking ?? false,
        showPreview: chatSettings.showPreview ?? false,
        viewMode: (chatSettings.viewMode as ViewMode) || 'grid'
      };
    } catch (error) {
      console.error('Error getting chat settings:', error);
      return null;
    }
  }

  /**
   * Save chat settings for a user in user_preferences table
   */
  async saveChatSettings(userId: string, settings: Partial<ChatSettings>): Promise<boolean> {
    try {
      // First, get existing preferences
      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      let preferences = {};
      if (!fetchError && existingData) {
        preferences = existingData.preferences || {};
      }

      // Update chat settings within preferences
      const updatedPreferences = {
        ...preferences,
        chatSettings: {
          ...(preferences.chatSettings || {}),
          ...settings
        }
      };

      // Try to update existing record first
      const { data: updateData, error: updateError } = await supabase
        .from('user_preferences')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      // If no rows were updated, insert a new record
      if (!updateError && (!updateData || updateData.length === 0)) {
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            preferences: updatedPreferences,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          throw insertError;
        }
      } else if (updateError) {
        throw updateError;
      }

      return true;
    } catch (error) {
      console.error('Error saving chat settings:', error);
      return false;
    }
  }

  /**
   * Update specific chat setting
   */
  async updateChatMode(userId: string, chatMode: ChatMode): Promise<boolean> {
    return this.saveChatSettings(userId, { chatMode });
  }

  async updateShowThinking(userId: string, showThinking: boolean): Promise<boolean> {
    return this.saveChatSettings(userId, { showThinking });
  }

  async updateShowPreview(userId: string, showPreview: boolean): Promise<boolean> {
    return this.saveChatSettings(userId, { showPreview });
  }

  async updateViewMode(userId: string, viewMode: ViewMode): Promise<boolean> {
    return this.saveChatSettings(userId, { viewMode });
  }

  /**
   * Get chat settings with timestamps from user_preferences table
   */
  async getChatSettingsWithTimestamps(userId: string): Promise<ChatSettingsWithTimestamps | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return defaults with current timestamp
          const now = new Date().toISOString();
          return {
            chatMode: 'thoughtful',
            showThinking: false,
            showPreview: false,
            viewMode: 'grid',
            createdAt: now,
            updatedAt: now
          };
        }
        throw error;
      }

      // Extract chat settings from preferences
      const preferences = data.preferences || {};
      const chatSettings = preferences.chatSettings || {};

      return {
        chatMode: (chatSettings.chatMode as ChatMode) || 'thoughtful',
        showThinking: chatSettings.showThinking ?? false,
        showPreview: chatSettings.showPreview ?? false,
        viewMode: (chatSettings.viewMode as ViewMode) || 'grid',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting chat settings with timestamps:', error);
      return null;
    }
  }

  /**
   * Delete chat settings for a user (removes chatSettings from preferences)
   */
  async deleteChatSettings(userId: string): Promise<boolean> {
    try {
      // Get existing preferences
      const { data: existingData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.log('No preferences found to delete chat settings from');
        return true;
      }

      const preferences = existingData.preferences || {};
      
      // Remove chatSettings from preferences
      const { chatSettings, ...updatedPreferences } = preferences;

      // Update the preferences without chatSettings
      const { error } = await supabase
        .from('user_preferences')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting chat settings:', error);
      return false;
    }
  }
}

export const chatSettingsService = new ChatSettingsService();
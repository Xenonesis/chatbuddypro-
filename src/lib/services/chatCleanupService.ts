import { supabase } from '@/lib/supabase';
import { userService } from './userService';

export interface CleanupResult {
  success: boolean;
  deletedChatsCount: number;
  deletedMessagesCount: number;
  error?: string;
}

export interface CleanupStats {
  totalChatsChecked: number;
  eligibleForDeletion: number;
  actuallyDeleted: number;
  errors: string[];
}

export const chatCleanupService = {
  /**
   * Clean up old chats for a specific user based on their retention settings
   */
  async cleanupUserChats(userId: string, retentionPeriodDays: number): Promise<CleanupResult> {
    try {
      console.log(`Starting chat cleanup for user ${userId} with retention period ${retentionPeriodDays} days`);
      
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionPeriodDays);
      const cutoffDateISO = cutoffDate.toISOString();
      
      console.log(`Deleting chats older than: ${cutoffDateISO}`);
      
      // First, get the chats that will be deleted to count messages
      const { data: chatsToDelete, error: fetchError } = await supabase
        .from('chats')
        .select('id')
        .eq('user_id', userId)
        .lt('created_at', cutoffDateISO);
      
      if (fetchError) {
        console.error('Error fetching chats to delete:', fetchError);
        return {
          success: false,
          deletedChatsCount: 0,
          deletedMessagesCount: 0,
          error: `Failed to fetch chats: ${fetchError.message}`
        };
      }
      
      if (!chatsToDelete || chatsToDelete.length === 0) {
        console.log('No chats found for deletion');
        return {
          success: true,
          deletedChatsCount: 0,
          deletedMessagesCount: 0
        };
      }
      
      const chatIds = chatsToDelete.map(chat => chat.id);
      console.log(`Found ${chatIds.length} chats to delete`);
      
      // Count messages that will be deleted
      const { count: messageCount, error: messageCountError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('chat_id', chatIds)
        .eq('user_id', userId);
      
      if (messageCountError) {
        console.error('Error counting messages:', messageCountError);
      }
      
      // Delete messages first (due to foreign key constraints)
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .in('chat_id', chatIds)
        .eq('user_id', userId);
      
      if (messagesError) {
        console.error('Error deleting chat messages:', messagesError);
        return {
          success: false,
          deletedChatsCount: 0,
          deletedMessagesCount: 0,
          error: `Failed to delete messages: ${messagesError.message}`
        };
      }
      
      // Then delete the chats
      const { error: chatsError } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDateISO);
      
      if (chatsError) {
        console.error('Error deleting chats:', chatsError);
        return {
          success: false,
          deletedChatsCount: 0,
          deletedMessagesCount: messageCount || 0,
          error: `Failed to delete chats: ${chatsError.message}`
        };
      }
      
      const result = {
        success: true,
        deletedChatsCount: chatIds.length,
        deletedMessagesCount: messageCount || 0
      };
      
      console.log('Chat cleanup completed:', result);
      return result;
      
    } catch (error) {
      console.error('Error in chat cleanup:', error);
      return {
        success: false,
        deletedChatsCount: 0,
        deletedMessagesCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Run cleanup for all users who have auto-deletion enabled
   */
  async runGlobalCleanup(): Promise<CleanupStats> {
    const stats: CleanupStats = {
      totalChatsChecked: 0,
      eligibleForDeletion: 0,
      actuallyDeleted: 0,
      errors: []
    };

    try {
      // Get all users with auto-deletion enabled from user_preferences
      const { data: userPreferences, error: prefsError } = await supabase
        .from('user_preferences')
        .select('user_id, preferences')
        .not('preferences', 'is', null);

      if (prefsError) {
        stats.errors.push(`Failed to fetch user preferences: ${prefsError.message}`);
        return stats;
      }

      if (!userPreferences || userPreferences.length === 0) {
        console.log('No user preferences found');
        return stats;
      }

      // Process each user
      for (const userPref of userPreferences) {
        try {
          const chatManagementSettings = userPref.preferences?.chatManagementSettings;
          
          if (!chatManagementSettings?.autoDeleteEnabled) {
            continue; // Skip users who don't have auto-deletion enabled
          }

          const retentionPeriod = chatManagementSettings.retentionPeriodDays || 30;
          
          console.log(`Processing cleanup for user ${userPref.user_id} with ${retentionPeriod} day retention`);
          
          const result = await this.cleanupUserChats(userPref.user_id, retentionPeriod);
          
          if (result.success) {
            stats.actuallyDeleted += result.deletedChatsCount;
            
            // Update last cleanup date for this user
            await this.updateLastCleanupDate(userPref.user_id);
          } else {
            stats.errors.push(`User ${userPref.user_id}: ${result.error}`);
          }
          
        } catch (userError) {
          const errorMsg = `Error processing user ${userPref.user_id}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
          stats.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log('Global cleanup completed:', stats);
      return stats;

    } catch (error) {
      const errorMsg = `Global cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      stats.errors.push(errorMsg);
      console.error(errorMsg);
      return stats;
    }
  },

  /**
   * Update the last cleanup date for a user
   */
  async updateLastCleanupDate(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Get current preferences
      const { data: currentPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user preferences for cleanup date update:', fetchError);
        return;
      }

      const updatedPreferences = {
        ...currentPrefs?.preferences,
        chatManagementSettings: {
          ...currentPrefs?.preferences?.chatManagementSettings,
          lastCleanupDate: now
        }
      };

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ 
          preferences: updatedPreferences,
          updated_at: now
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating last cleanup date:', updateError);
      } else {
        console.log(`Updated last cleanup date for user ${userId}`);
      }
    } catch (error) {
      console.error('Error in updateLastCleanupDate:', error);
    }
  },

  /**
   * Get cleanup statistics for a user (how many chats would be deleted)
   */
  async getCleanupPreview(userId: string, retentionPeriodDays: number): Promise<{ chatCount: number; messageCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionPeriodDays);
      const cutoffDateISO = cutoffDate.toISOString();

      // Count chats that would be deleted
      const { count: chatCount, error: chatError } = await supabase
        .from('chats')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lt('created_at', cutoffDateISO);

      if (chatError) {
        console.error('Error counting chats for preview:', chatError);
        return { chatCount: 0, messageCount: 0 };
      }

      // Count messages that would be deleted
      const { count: messageCount, error: messageError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lt('created_at', cutoffDateISO);

      if (messageError) {
        console.error('Error counting messages for preview:', messageError);
        return { chatCount: chatCount || 0, messageCount: 0 };
      }

      return {
        chatCount: chatCount || 0,
        messageCount: messageCount || 0
      };
    } catch (error) {
      console.error('Error in getCleanupPreview:', error);
      return { chatCount: 0, messageCount: 0 };
    }
  }
};

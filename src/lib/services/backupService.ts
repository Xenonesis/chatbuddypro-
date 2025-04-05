import { createServiceClient } from '@/lib/supabase';
import { chatService } from './chatService';

export const backupService = {
  // Schedule automatic backups for all users
  async scheduleBackups(): Promise<void> {
    try {
      const serviceClient = createServiceClient();
      
      // Get all users
      const { data: users, error: usersError } = await serviceClient
        .from('users')
        .select('id');
        
      if (usersError) {
        console.error('Error fetching users for backup:', usersError);
        return;
      }
      
      // Backup each user's chats
      const backupPromises = users.map(user => 
        chatService.backupUserChats(user.id)
      );
      
      // Execute backups in parallel with a limit
      const batchSize = 5;
      for (let i = 0; i < backupPromises.length; i += batchSize) {
        const batch = backupPromises.slice(i, i + batchSize);
        await Promise.all(batch);
      }
      
      console.log(`Scheduled backups completed for ${users.length} users`);
    } catch (error) {
      console.error('Error in scheduled backups:', error);
    }
  },
  
  // Find outdated backups (older than 30 days) and clean them up
  async cleanupOldBackups(): Promise<void> {
    try {
      const serviceClient = createServiceClient();
      
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = thirtyDaysAgo.toISOString();
      
      // Delete backups older than cutoff date
      const { error } = await serviceClient
        .from('user_backups')
        .delete()
        .lt('created_at', cutoffDate);
        
      if (error) {
        console.error('Error cleaning up old backups:', error);
        return;
      }
      
      console.log('Old backups cleanup completed');
    } catch (error) {
      console.error('Error in backup cleanup:', error);
    }
  },
  
  // Get list of backups for a user
  async getUserBackups(userId: string): Promise<any[]> {
    try {
      const { data, error } = await createServiceClient()
        .from('user_backups')
        .select('id, created_at')
        .eq('user_id', userId as any)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching user backups:', error);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user backups:', error);
      return [];
    }
  },
}; 

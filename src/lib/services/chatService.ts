import { supabase, createServiceClient, Chat, ChatMessage } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '@/lib/services/userService';

export const chatService = {
  // Create a new chat
  async createChat(
    userId: string, 
    title: string, 
    model?: string,
    userEmail?: string,
    userName?: string
  ): Promise<Chat | null> {
    try {
      console.log('Creating new chat with user info:', { userId, userEmail, userName });
      
      // Try using the new function first
      if (userEmail && userName) {
        const chatId = await userService.saveChatWithUserInfo(
          userId,
          title,
          model || '',
          userEmail,
          userName
        );
        
        if (chatId) {
          // Get the created chat
          const { data, error } = await supabase
            .from('chats')
            .select()
            .eq('id', chatId as any as any)
            .single();
            
            if (!error) {
              return data as unknown as Chat;
            }
        }
      }
      
      // Fallback to original method
      const chatId = uuidv4();
      const { data, error } = await supabase
        .from('chats')
        .insert({
          id: chatId,
          user_id: userId,
          title,
          model,
          user_email: userEmail,
          user_name: userName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        return null;
      }

      return data as unknown as Chat;
    } catch (error) {
      console.error('Unexpected error in createChat:', error);
      return null;
    }
  },

  // Get all chats for a user
  async getUserChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId as any as any)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }

    return data as unknown as Chat[];
  },

  // Get a single chat by ID
  async getChat(chatId: string, userId: string): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId as any as any)
      .eq('user_id', userId as any as any)
      .single();

    if (error) {
      console.error('Error fetching chat:', error);
      return null;
    }

    return data as unknown as Chat;
  },

  // Update chat details
  async updateChat(chatId: string, userId: string, updates: Partial<Chat>): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', chatId as any as any)
      .eq('user_id', userId as any as any);

    if (error) {
      console.error('Error updating chat:', error);
      return false;
    }

    return true;
  },

  // Delete a chat
  async deleteChat(chatId: string, userId: string): Promise<boolean> {
    // First delete all messages in the chat
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('chat_id', chatId as any as any)
      .eq('user_id', userId as any as any);

    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError);
      return false;
    }

    // Then delete the chat
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId as any as any)
      .eq('user_id', userId as any as any);

    if (error) {
      console.error('Error deleting chat:', error);
      return false;
    }

    return true;
  },

  // Add a message to a chat
  async addMessage(
    chatId: string,
    userId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<ChatMessage | null> {
    const messageId = uuidv4();
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        id: messageId,
        chat_id: chatId,
        user_id: userId,
        role,
        content,
        created_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    // Update the chat's last_message and updated_at
    await this.updateChat(chatId, userId, {
      last_message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      updated_at: new Date().toISOString(),
    });

    return data as unknown as ChatMessage;
  },

  // Get all messages for a chat
  async getChatMessages(chatId: string, userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId as any as any)
      .eq('user_id', userId as any as any)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    return data as unknown as ChatMessage[];
  },

  // Export chat history as JSON
  async exportChatAsJson(chatId: string, userId: string): Promise<string> {
    const chat = await this.getChat(chatId, userId);
    const messages = await this.getChatMessages(chatId, userId);

    if (!chat) {
      throw new Error('Chat not found');
    }

    const exportData = {
      chat: {
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        model: chat.model,
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  },

  // Backup all user's chats (admin function)
  async backupUserChats(userId: string): Promise<boolean> {
    // Use service role client for admin operations
    const serviceClient = createServiceClient();
    
    const { data: chats, error: chatsError } = await serviceClient
      .from('chats')
      .select('*')
      .eq('user_id', userId as any as any);
    
    if (chatsError) {
      console.error('Error fetching chats for backup:', chatsError);
      return false;
    }
    
    const { data: messages, error: messagesError } = await serviceClient
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId as any as any);
      
    if (messagesError) {
      console.error('Error fetching messages for backup:', messagesError);
      return false;
    }
    
    const backupData = {
      user_id: userId,
      backup_date: new Date().toISOString(),
      chats: chats,
      messages: messages,
    };
    
    const { error: backupError } = await serviceClient
      .from('user_backups')
      .insert({
        user_id: userId,
        data: backupData,
        created_at: new Date().toISOString(),
      });
      
    if (backupError) {
      console.error('Error creating backup:', backupError);
      return false;
    }
    
    return true;
  },

  // Restore chat from a backup (admin function)
  async restoreFromBackup(userId: string, backupId: string): Promise<boolean> {
    const serviceClient = createServiceClient();
    
    const { data: backup, error: backupError } = await serviceClient
      .from('user_backups')
      .select('data')
      .eq('id', backupId as any as any)
      .eq('user_id', userId as any as any)
      .single();
      
    if (backupError || !backup) {
      console.error('Error fetching backup:', backupError);
      return false;
    }
    
    // Implement restoration logic here
    // This would involve deleting existing chats and messages, then recreating from backup
    
    return true;
  },
}; 

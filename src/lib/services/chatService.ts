import { supabase, createServiceClient, Chat, ChatMessage } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '@/lib/services/userService';
import { createEnhancedError, withErrorHandling } from '@/lib/errorHandler';

// Enhanced chat service with comprehensive error handling and metadata management
export const chatService = {
  // Create a new chat with enhanced error handling and metadata
  async createChat(
    userId: string,
    title: string,
    model?: string,
    userEmail?: string,
    userName?: string,
    tags?: string[]
  ): Promise<Chat | null> {
    return withErrorHandling(
      async () => {
        if (!userId) {
          throw createEnhancedError('User ID is required', {
            category: 'validation',
            severity: 'high',
            userMessage: 'User identification missing',
            retryable: false
          });
        }

        if (!title?.trim()) {
          throw createEnhancedError('Chat title is required', {
            category: 'validation',
            severity: 'medium',
            userMessage: 'Please provide a chat title',
            retryable: false
          });
        }

        console.log('Creating new chat with user info:', { userId, userEmail, userName, model, tags });

        // Try using the enhanced function first
        if (userEmail && userName) {
          const chatId = await userService.saveChatWithUserInfo(
            userId,
            title.trim(),
            model || '',
            userEmail,
            userName
          );

          if (chatId) {
            // Update with additional metadata if provided
            if (tags && tags.length > 0) {
              await this.updateChatMetadata(chatId, userId, { tags });
            }

            // Get the created chat with all fields
            const { data, error } = await supabase
              .from('chats')
              .select('*')
              .eq('id', chatId)
              .single();

              if (!error && data) {
                return data as Chat;
              }
          }
        }
      
        // Fallback to direct insert with enhanced metadata
        const chatId = uuidv4();
        const now = new Date().toISOString();

        const { data, error } = await supabase
          .from('chats')
          .insert({
            id: chatId,
            user_id: userId,
            title: title.trim(),
            model: model || '',
            user_email: userEmail,
            user_name: userName,
            tags: tags || [],
            is_archived: false,
            message_count: 0,
            created_at: now,
            updated_at: now,
          })
          .select('*')
          .single();

        if (error) {
          // Fallback: if schema doesn't have optional columns, retry with minimal insert
          const msg = (error as any)?.message || '';
          const missingOptionalCols = msg.includes('column') && (msg.includes('user_email') || msg.includes('user_name') || msg.includes('tags') || msg.includes('is_archived') || msg.includes('message_count'));

          if (missingOptionalCols) {
            console.warn('Optional columns missing on chats table; retrying minimal insert');
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('chats')
              .insert({
                id: chatId,
                user_id: userId,
                title: title.trim(),
                model: model || '',
                created_at: now,
                updated_at: now,
              })
              .select('*')
              .single();

            if (fallbackError) {
              throw createEnhancedError(`Failed to create chat (fallback): ${fallbackError.message}`, {
                category: 'database',
                severity: 'high',
                userMessage: 'Failed to create new chat. Please try again.',
                retryable: true,
                originalError: fallbackError
              });
            }

            console.log('Successfully created chat with minimal schema:', chatId);
            return fallbackData as Chat;
          }

          throw createEnhancedError(`Failed to create chat: ${msg}`, {
            category: 'database',
            severity: 'high',
            userMessage: 'Failed to create new chat. Please try again.',
            retryable: true,
            originalError: error
          });
        }

        console.log('Successfully created chat:', chatId);
        return data as Chat;
      },
      {
        context: 'createChat',
        fallback: null
      }
    );
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

  // Add a message to a chat with enhanced error handling and metadata
  async addMessage(
    chatId: string,
    userId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage | null> {
    return withErrorHandling(
      async () => {
        if (!chatId) {
          throw createEnhancedError('Chat ID is required', {
            category: 'validation',
            severity: 'high',
            userMessage: 'Invalid chat session',
            retryable: false
          });
        }

        if (!userId) {
          throw createEnhancedError('User ID is required', {
            category: 'validation',
            severity: 'high',
            userMessage: 'User identification missing',
            retryable: false
          });
        }

        if (!content?.trim()) {
          throw createEnhancedError('Message content is required', {
            category: 'validation',
            severity: 'medium',
            userMessage: 'Please enter a message',
            retryable: false
          });
        }

        const messageId = uuidv4();
        const now = new Date().toISOString();

        // Insert message with automatic ordering (handled by database trigger)
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            id: messageId,
            chat_id: chatId,
            user_id: userId,
            role,
            content: content.trim(),
            metadata: metadata || {},
            created_at: now,
          })
          .select('*')
          .single();

        if (error) {
          throw createEnhancedError(`Failed to add message: ${error.message}`, {
            category: 'database',
            severity: 'high',
            userMessage: 'Failed to send message. Please try again.',
            retryable: true,
            originalError: error
          });
        }

        console.log('Successfully added message:', messageId);

        // The chat metadata (last_message, message_count, etc.) is automatically
        // updated by database triggers, but we can also update manually if needed
        const lastMessagePreview = content.length > 100
          ? content.substring(0, 100) + '...'
          : content;

        await this.updateChat(chatId, userId, {
          last_message: lastMessagePreview,
          updated_at: now,
        });

        return data as ChatMessage;
      },
      {
        context: 'addMessage',
        fallback: null
      }
    );
  },

  // Get messages for a specific chat with enhanced ordering and pagination
  async getChatMessages(
    chatId: string,
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: 'created_at' | 'message_order';
      ascending?: boolean;
    }
  ): Promise<ChatMessage[]> {
    return withErrorHandling(
      async () => {
        if (!chatId || !userId) {
          throw createEnhancedError('Chat ID and User ID are required', {
            category: 'validation',
            severity: 'high',
            userMessage: 'Invalid chat or user identification',
            retryable: false
          });
        }

        const {
          limit = 1000,
          offset = 0,
          orderBy = 'message_order',
          ascending = true
        } = options || {};

        // Try with the requested orderBy first, fallback to created_at if column doesn't exist
        let query = supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .eq('user_id', userId)
          .range(offset, offset + limit - 1);

        // Try to order by the requested column, fallback to created_at
        try {
          query = query.order(orderBy, { ascending });
        } catch (orderError) {
          console.log('Falling back to created_at ordering due to:', orderError);
          query = query.order('created_at', { ascending });
        }

        const { data, error } = await query;

        // If we get a column error, try again with created_at ordering
        if (error && error.message.includes('column') && orderBy !== 'created_at') {
          console.log('Retrying with created_at ordering due to column error:', error.message);

          const fallbackQuery = supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatId)
            .eq('user_id', userId)
            .order('created_at', { ascending })
            .range(offset, offset + limit - 1);

          const { data: fallbackData, error: fallbackError } = await fallbackQuery;

          if (fallbackError) {
            throw createEnhancedError(`Failed to fetch chat messages: ${fallbackError.message}`, {
              category: 'database',
              severity: 'high',
              userMessage: 'Failed to load chat messages. Please try again.',
              retryable: true,
              originalError: fallbackError
            });
          }

          console.log(`Successfully fetched ${fallbackData?.length || 0} messages for chat (fallback):`, chatId);
          return (fallbackData || []) as ChatMessage[];
        }

        if (error) {
          throw createEnhancedError(`Failed to fetch chat messages: ${error.message}`, {
            category: 'database',
            severity: 'high',
            userMessage: 'Failed to load chat messages. Please try again.',
            retryable: true,
            originalError: error
          });
        }

        console.log(`Successfully fetched ${data?.length || 0} messages for chat:`, chatId);
        return (data || []) as ChatMessage[];
      },
      {
        context: 'getChatMessages',
        fallback: []
      }
    );
  },

  // Delete a chat with enhanced error handling
  async deleteChat(chatId: string, userId: string): Promise<boolean> {
    return withErrorHandling(
      async () => {
        if (!chatId || !userId) {
          throw createEnhancedError('Chat ID and User ID are required', {
            category: 'validation',
            severity: 'high',
            userMessage: 'Invalid chat or user identification',
            retryable: false
          });
        }

        const { error } = await supabase
          .from('chats')
          .delete()
          .eq('id', chatId)
          .eq('user_id', userId);

        if (error) {
          throw createEnhancedError(`Failed to delete chat: ${error.message}`, {
            category: 'database',
            severity: 'high',
            userMessage: 'Failed to delete chat. Please try again.',
            retryable: true,
            originalError: error
          });
        }

        console.log('Successfully deleted chat:', chatId);
        return true;
      },
      {
        operation: 'deleteChat',
        fallbackValue: false
      }
    );
  },

  // Archive/unarchive a chat
  async archiveChat(chatId: string, userId: string, archived: boolean = true): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const { error } = await supabase
          .from('chats')
          .update({
            is_archived: archived,
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId)
          .eq('user_id', userId);

        if (error) {
          throw createEnhancedError(`Failed to ${archived ? 'archive' : 'unarchive'} chat: ${error.message}`, {
            category: 'database',
            severity: 'medium',
            userMessage: `Failed to ${archived ? 'archive' : 'unarchive'} chat. Please try again.`,
            retryable: true,
            originalError: error
          });
        }

        console.log(`Successfully ${archived ? 'archived' : 'unarchived'} chat:`, chatId);
        return true;
      },
      {
        operation: 'archiveChat',
        fallbackValue: false
      }
    );
  },

  // Update chat metadata (tags, title, etc.)
  async updateChatMetadata(
    chatId: string,
    userId: string,
    metadata: Partial<Pick<Chat, 'title' | 'tags' | 'is_archived'>>
  ): Promise<boolean> {
    return withErrorHandling(
      async () => {
        const updateData = {
          ...metadata,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('chats')
          .update(updateData)
          .eq('id', chatId)
          .eq('user_id', userId);

        if (error) {
          throw createEnhancedError(`Failed to update chat metadata: ${error.message}`, {
            category: 'database',
            severity: 'medium',
            userMessage: 'Failed to update chat. Please try again.',
            retryable: true,
            originalError: error
          });
        }

        console.log('Successfully updated chat metadata:', chatId);
        return true;
      },
      {
        operation: 'updateChatMetadata',
        fallbackValue: false
      }
    );
  },

  // Get chat statistics
  async getChatStats(userId: string): Promise<{
    totalChats: number;
    totalMessages: number;
    archivedChats: number;
    recentChats: number;
  }> {
    return withErrorHandling(
      async () => {
        // Get total chats
        const { count: totalChats } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Get archived chats
        const { count: archivedChats } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_archived', true);

        // Get recent chats (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: recentChats } = await supabase
          .from('chats')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString());

        // Get total messages
        const { count: totalMessages } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        return {
          totalChats: totalChats || 0,
          totalMessages: totalMessages || 0,
          archivedChats: archivedChats || 0,
          recentChats: recentChats || 0,
        };
      },
      {
        operation: 'getChatStats',
        fallbackValue: {
          totalChats: 0,
          totalMessages: 0,
          archivedChats: 0,
          recentChats: 0,
        }
      }
    );
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

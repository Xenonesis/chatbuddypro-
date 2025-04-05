import { supabase, UserPreferences, UserProfile, encryptApiKey, decryptApiKey } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Interface for API key information
export interface ApiKeyInfo {
  key: string;
  name: string;
  created?: string;
}

export const userService = {
  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      // Log user ID for tracing purposes
      console.debug(`Fetching preferences for user: ${userId}`);

      if (!userId) {
        console.error('Cannot get user preferences: userId is missing');
        return null;
      }

      // Try to get user preferences - getting all matching records to handle duplicates
      console.debug(`Querying user_preferences for user_id: ${userId}`);
      const response = await supabase
        .from('user_preferences')
        .select('id, user_id, preferences, api_keys, created_at, updated_at')
        .eq('user_id', userId as any)
        .order('updated_at', { ascending: false }); // Get most recent first

      // Log raw response status for debugging
      console.debug(`Supabase response status: ${response.status}`);
      
      if (response.error) {
        // Create safe error object that won't throw during stringification
        const safeError = {
          code: response.error.code || 'unknown',
          message: response.error.message || 'Unknown error',
          details: response.error.details || {},
          hint: response.error.hint || null,
          status: response.status || null
        };
        
        console.error(`Error fetching user preferences: ${JSON.stringify(safeError)}`);

        // If the error is about missing preferences column, it could be a schema issue
        // We'll attempt to work with just api_keys
        if (response.error.message && response.error.message.includes('column') && 
            response.error.message.includes('preferences')) {
          console.warn('Column issue detected, trying legacy approach');
          return this.getUserPreferencesLegacy(userId);
        }
        
        return null;
      }

      // Check if we got any data back
      if (!response.data || response.data.length === 0) {
        console.warn(`No preferences found for user: ${userId}`);
        return null;
      }

      // If we have multiple records, log a warning (this should be fixed by the cleanup script)
      if (response.data.length > 1) {
        console.warn(`Found ${response.data.length} preference records for user ${userId}, using most recent`);
      }

      // Get the first (most recent) result
      const userPrefs = response.data[0] as any;
      console.debug(`Using preference record with id ${userPrefs.id}`);

      // Handle both formats - with or without preferences column
      if (!userPrefs.preferences) {
        console.debug('No preferences field found, creating compatibility wrapper');
        userPrefs.preferences = {};
        
        // If we have api_keys but no preferences.api_keys, migrate the data structure
        if (userPrefs.api_keys) {
          console.debug('Using legacy api_keys format for compatibility');
          userPrefs.preferences.api_keys = userPrefs.api_keys;
        }
      } else if (typeof userPrefs.preferences === 'string') {
        // Handle case where preferences might be stored as a string
        try {
          console.debug('Preferences stored as string, parsing...');
          userPrefs.preferences = JSON.parse(userPrefs.preferences);
        } catch (parseError) {
          console.error('Error parsing preferences string:', parseError);
          userPrefs.preferences = {};
        }
      }

      console.debug(`Successfully fetched preferences for user: ${userId}`);
      return userPrefs;
    } catch (error) {
      // Handle any unexpected errors
      const safeError = error instanceof Error 
        ? { message: error.message, name: error.name, stack: error.stack } 
        : { message: String(error) };
      
      console.error(`Exception in getUserPreferences: ${JSON.stringify(safeError)}`);
      return null;
    }
  },
  
  // Legacy method for fetching preferences when preferences column doesn't exist
  async getUserPreferencesLegacy(userId: string): Promise<UserPreferences | null> {
    try {
      console.debug(`Fetching preferences using legacy schema for user: ${userId}`);
      
      const response = await supabase
        .from('user_preferences')
        .select('id, user_id, api_keys, created_at, updated_at, theme, language')
        .eq('user_id', userId as any)
        .order('updated_at', { ascending: false }) // Get the most recently updated record
        .limit(1);
      
      if (response.error) {
        const safeError = {
          code: response.error.code || 'unknown',
          message: response.error.message || 'Unknown error',
          details: response.error.details || {},
          hint: response.error.hint || null,
          status: response.status || null
        };
        
        console.error(`Error fetching user preferences with legacy schema: ${JSON.stringify(safeError)}`);
        return null;
      }
      
      if (!response.data || response.data.length === 0) {
        console.warn(`No preferences found for user with legacy schema: ${userId}`);
        return null;
      }
      
      // Get the first result
      const userPrefs = response.data[0] as any;
      
      // Convert from legacy format to new format
      const result = {
        ...userPrefs,
        preferences: {
          api_keys: userPrefs.api_keys || {},
          theme: userPrefs.theme,
          language: userPrefs.language
        }
      };
      
      console.debug(`Successfully fetched preferences with legacy schema for user: ${userId}`);
      return result;
    } catch (error) {
      const safeError = error instanceof Error 
        ? { message: error.message, name: error.name, stack: error.stack } 
        : { message: String(error) };
      
      console.error(`Exception in getUserPreferencesLegacy: ${JSON.stringify(safeError)}`);
      return null;
    }
  },

  // Create default preferences
  async createDefaultPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      console.log(`Creating default preferences for user ID: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          id: uuidv4(),
          user_id: userId,
          theme: 'light',
          language: 'en',
          api_keys: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default preferences:', {
          code: error.code, 
          message: error.message,
          details: error.details
        });
        return null;
      }

      console.log('Successfully created default preferences');
      return data as UserPreferences;
    } catch (error) {
      console.error('Unexpected error in createDefaultPreferences:', error instanceof Error ? error.message : String(error));
      return null;
    }
  },

  // Create or update user preferences
  async upsertUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences | null> {
    try {
      // Check if user preferences already exist
      const existing = await this.getUserPreferences(userId);

      if (existing) {
        // Update existing preferences
        console.log(`Updating existing preferences for user ${userId.substring(0, 8)}...`);
        const { data, error } = await supabase
          .from('user_preferences')
          .update({
            ...preferences,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id as any)
          .select()
          .single();

        if (error) {
          console.error('Error updating user preferences:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
          return null;
        }

        return data as UserPreferences;
      } else {
        // Create new preferences
        console.log(`Creating new preferences for user ${userId.substring(0, 8)}...`);
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({
            id: uuidv4(),
            user_id: userId,
            theme: preferences.theme || 'light',
            language: preferences.language || 'en',
            api_keys: preferences.api_keys || {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user preferences:', {
            code: error.code,
            message: error.message,
            details: error.details
          });
          return null;
        }

        return data as UserPreferences;
      }
    } catch (error) {
      console.error('Error in upsertUserPreferences:', error instanceof Error ? error.message : String(error));
      return null;
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId as any)
        .single();

      if (error) {
        // If the error is that no rows were returned, we should create a new profile
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating a new one');
          return this.createInitialProfile(userId);
        }
        
        console.error('Error details:', error.code, error.message, error.details);
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  // Helper to create initial profile
  async createInitialProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: uuidv4(),
          user_id: userId,
          full_name: '',
          age: null,
          gender: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating initial profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in createInitialProfile:', error);
      return null;
    }
  },

  // Create or update user profile
  async upsertUserProfile(
    userId: string,
    profile: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      console.log('Attempting to upsert profile for user:', userId, profile);
      
      // First try direct insert - if the profile doesn't exist, this will create it
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            id: uuidv4(),
            user_id: userId,
            full_name: profile.full_name || '',
            age: profile.age || null,
            gender: profile.gender || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (!error) {
          console.log('Successfully created new profile:', data);
          return data as UserProfile;
        }
        
        // If error is not related to uniqueness constraint, something else went wrong
        if (!error.message.includes('duplicate') && !error.message.includes('unique constraint')) {
          console.error('Error creating profile (not a duplicate error):', error);
          throw error;
        }
        
        console.log('Profile already exists, will update instead');
      } catch (insertError) {
        console.log('Insert failed, trying update instead:', insertError);
      }
      
      // If we're here, the profile likely exists, so get it first
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId as any)
        .single();
      
      if (fetchError) {
        console.error('Error fetching existing profile for update:', fetchError);
        throw fetchError;
      }
      
      if (!existingProfile) {
        console.error('No existing profile found but insert failed');
        return null;
      }
      
      // Now update the existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id as any)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }
      
      console.log('Successfully updated profile:', updatedProfile);
      return updatedProfile as UserProfile;
    } catch (error) {
      console.error('Fatal error in upsertUserProfile:', error);
      return null;
    }
  },

  // Store an API key
  async storeApiKey(
    userId: string,
    provider: string,
    apiKey: string
  ): Promise<boolean> {
    try {
      // Validate input parameters
      if (!userId) {
        console.error('Cannot store API key: User ID is missing');
        return false;
      }
      
      if (!provider) {
        console.error('Cannot store API key: Provider is missing');
        return false;
      }
      
      if (!apiKey) {
        console.error('Cannot store API key: API key is empty');
        return false;
      }
      
      console.log(`Storing API key for provider ${provider} and user ${userId.substring(0, 8)}...`);
      
      // Get current preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Encrypt the API key
      const encryptedKey = await encryptApiKey(apiKey, userId);
      
      // Store in localStorage for immediate access on this device
      try {
        if (typeof window !== 'undefined') {
          const localStorageKey = `chatbuddy_api_key_${provider}_${userId}`;
          localStorage.setItem(localStorageKey, encryptedKey);
          console.log(`Stored API key in local storage with key: ${localStorageKey}`);
        }
      } catch (localStorageError) {
        console.warn('Could not store API key in localStorage:', localStorageError);
        // Continue with database storage even if local storage fails
      }
      
      if (!preferences) {
        // Create new preferences with this API key
        console.log('No existing preferences found, creating new preferences');
        const apiKeys = { [provider]: encryptedKey };
        
        await this.upsertUserPreferences(userId, {
          api_keys: apiKeys,
        });
        
        return true;
      }
      
      // Update existing preferences
      console.log('Updating existing preferences with new API key');
      const apiKeys = preferences.api_keys || {};
      
      await this.upsertUserPreferences(userId, {
        api_keys: {
          ...apiKeys,
          [provider]: encryptedKey,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error storing API key:', error instanceof Error ? error.message : String(error));
      return false;
    }
  },

  // Retrieve and decrypt an API key - optimized to check localStorage first
  async getApiKey(provider: string, userId: string): Promise<string | null> {
    try {
      console.debug(`Attempting to get API key for provider: ${provider}`);
      
      if (!userId) {
        console.error('Cannot get API key: userId is missing');
        return null;
      }

      // First check in localStorage for faster access
      if (typeof window !== 'undefined') {
        try {
          const localStorageKey = `chatbuddy_api_key_${provider}_${userId}`;
          const localApiKey = localStorage.getItem(localStorageKey);
          
          if (localApiKey) {
            console.debug(`Found API key in localStorage for ${provider}`);
            return decryptApiKey(localApiKey, userId);
          }
        } catch (localStorageError) {
          console.warn('Error accessing localStorage:', localStorageError);
          // Continue to database lookup if localStorage fails
        }
      }

      // If not in localStorage, check database
      const userPreferences = await this.getUserPreferences(userId);
      
      if (!userPreferences) {
        console.warn(`No user preferences found for user ${userId}`);
        return null;
      }
      
      try {
        // Check in preferences.api_keys (new structure)
        const preferences = userPreferences.preferences || {};
        
        if (preferences.api_keys && preferences.api_keys[provider]) {
          const apiKey = preferences.api_keys[provider];
          console.debug(`Found API key in preferences.api_keys for ${provider}`);
          
          // Store in localStorage for future fast access
          if (typeof window !== 'undefined') {
            try {
              const localStorageKey = `chatbuddy_api_key_${provider}_${userId}`;
              localStorage.setItem(localStorageKey, apiKey);
            } catch (e) {
              // Ignore localStorage errors
            }
          }
          
          return decryptApiKey(apiKey, userId);
        }
        
        // Check in legacy api_keys structure
        if (userPreferences.api_keys && userPreferences.api_keys[provider]) {
          const apiKey = userPreferences.api_keys[provider];
          console.debug(`Found API key in legacy api_keys for ${provider}`);
          
          // Store in localStorage for future fast access
          if (typeof window !== 'undefined') {
            try {
              const localStorageKey = `chatbuddy_api_key_${provider}_${userId}`;
              localStorage.setItem(localStorageKey, apiKey);
            } catch (e) {
              // Ignore localStorage errors
            }
          }
          
          return decryptApiKey(apiKey, userId);
        }
        
        console.warn(`No API key found for provider ${provider}`);
        return null;
      } catch (prefError) {
        console.error(`Error accessing API key data: ${prefError instanceof Error ? prefError.message : String(prefError)}`);
        return null;
      }
    } catch (error) {
      const safeError = error instanceof Error 
        ? { message: error.message, name: error.name } 
        : { message: String(error) };
      
      console.error(`Exception in getApiKey for provider ${provider}: ${JSON.stringify(safeError)}`);
      return null;
    }
  },

  // Delete an API key
  async deleteApiKey(
    userId: string,
    provider: string
  ): Promise<boolean> {
    try {
      // Remove from localStorage first
      if (typeof window !== 'undefined') {
        try {
          const localStorageKey = `chatbuddy_api_key_${provider}_${userId}`;
          localStorage.removeItem(localStorageKey);
          console.log(`Removed API key from localStorage: ${localStorageKey}`);
        } catch (localStorageError) {
          console.warn('Error removing key from localStorage:', localStorageError);
          // Continue with database deletion even if localStorage fails
        }
      }
      
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences || !preferences.api_keys) {
        return false;
      }
      
      const apiKeys = { ...preferences.api_keys };
      
      if (apiKeys[provider]) {
        delete apiKeys[provider];
        
        await this.upsertUserPreferences(userId, {
          api_keys: apiKeys,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  },

  // Export all user data
  async exportUserData(userId: string): Promise<string> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Get user profile
      const profile = await this.getUserProfile(userId);

      // Get all user chats
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId as any);
      
      if (chatsError) {
        throw chatsError;
      }
      
      // Get all chat messages
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId as any);
      
      if (messagesError) {
        throw messagesError;
      }
      
      // Create export object (excluding encrypted API keys for security)
      const exportData = {
        user: {
          id: userId,
          profile: {
            full_name: profile?.full_name,
            age: profile?.age,
            gender: profile?.gender,
          },
          preferences: {
            theme: preferences?.theme,
            language: preferences?.language,
          },
        },
        chats: chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          model: chat.model,
        })),
        messages: messages.map(msg => ({
          chat_id: msg.chat_id,
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
        })),
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  },

  // Store an API key with a name
  async storeApiKeyWithName(
    userId: string,
    provider: string,
    apiKey: string,
    keyName: string
  ): Promise<boolean> {
    try {
      console.log(`Storing API key for ${provider} with name: ${keyName}`);
      
      if (!userId || !provider || !apiKey) {
        console.error('Missing required parameters in storeApiKeyWithName');
        return false;
      }
      
      // Encrypt the API key
      const encryptedKey = await encryptApiKey(apiKey, userId);
      
      // Call the Supabase function to store the key with name
      try {
        const { data, error } = await supabase.rpc('save_api_key_with_name', {
          p_user_id: userId,
          p_provider: provider,
          p_api_key: encryptedKey,
          p_key_name: keyName
        });
        
        if (error) {
          console.error('Error storing API key with name via RPC:', {
            code: error?.code || 'unknown',
            message: error?.message || 'Unknown error',
            details: error?.details || null
          });
          throw error; // Will be caught by fallback
        }
        
        console.log(`Successfully stored API key for ${provider} with name via RPC`);
        return true;
      } catch (rpcError) {
        console.log('RPC failed, trying fallback update method');
        
        // Fallback to direct profile update if RPC fails
        try {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: userId,
              api_keys_with_names: {
                [provider]: {
                  key: encryptedKey,
                  name: keyName
                }
              },
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          if (updateError) {
            console.error('Fallback update failed:', {
              code: updateError?.code || 'unknown',
              message: updateError?.message || 'Unknown error',
              details: updateError?.details || null
            });
            return false;
          }
          
          console.log(`Successfully stored API key for ${provider} with name via fallback`);
          return true;
        } catch (fallbackError) {
          console.error('Error in fallback update:', 
            fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
          return false;
        }
      }
    } catch (error) {
      console.error('Error in storeApiKeyWithName:',
        error instanceof Error ? error.message : String(error));
      return false;
    }
  },
  
  // Get API key by name
  async getApiKeyByName(provider: string, keyName: string, userId: string): Promise<ApiKeyInfo | null> {
    try {
      console.debug(`Fetching named API key: provider=${provider}, name=${keyName}`);
      
      if (!userId) {
        console.error('Cannot get named API key: userId is missing');
        return null;
      }

      const response = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId as any)
        .order('updated_at', { ascending: false }) // Get the most recently updated record
        .limit(1);
      
      // Create safe error object if needed
      if (response.error) {
        const safeError = {
          code: response.error.code || 'unknown',
          message: response.error.message || 'Unknown error',
          details: response.error.details || {},
          status: response.status || null
        };
        
        console.error(`Error fetching user preferences for named key: ${JSON.stringify(safeError)}`);
        return null;
      }
      
      if (!response.data || response.data.length === 0) {
        console.warn(`No preferences found for user ${userId} when getting named key`);
        return null;
      }
      
      // Get the first result
      const userPrefs = response.data[0];
      
      try {
        const preferences = userPrefs.preferences || {};
        
        if (!preferences.named_api_keys || !preferences.named_api_keys[provider]) {
          console.warn(`No named API keys found for provider ${provider}`);
          return null;
        }
        
        const namedKeys = preferences.named_api_keys[provider];
        const matchingKey = namedKeys.find((k: any) => k.name === keyName);
        
        if (!matchingKey) {
          console.warn(`No API key found with name "${keyName}" for provider ${provider}`);
          return null;
        }
        
        try {
          const decryptedKey = await decryptApiKey(matchingKey.key);
          console.debug(`Successfully retrieved and decrypted named API key: ${keyName}`);
          
          return {
            name: matchingKey.name,
            key: decryptedKey,
            created: matchingKey.created || new Date().toISOString()
          };
        } catch (decryptError) {
          console.error(`Error decrypting named API key: ${decryptError instanceof Error ? decryptError.message : String(decryptError)}`);
          return null;
        }
      } catch (prefError) {
        console.error(`Error accessing named API key data: ${prefError instanceof Error ? prefError.message : String(prefError)}`);
        return null;
      }
    } catch (error) {
      const safeError = error instanceof Error 
        ? { message: error.message, name: error.name } 
        : { message: String(error) };
      
      console.error(`Exception in getApiKeyByName for provider ${provider}, keyName ${keyName}: ${JSON.stringify(safeError)}`);
      return null;
    }
  },
  
  // Save chat with user info
  async saveChatWithUserInfo(
    userId: string,
    title: string,
    model: string,
    userEmail: string,
    userName: string
  ): Promise<string | null> {
    try {
      console.log('Saving chat with user info');
      
      // Call the Supabase function
      const { data, error } = await supabase.rpc('save_chat_with_user_info', {
        p_user_id: userId,
        p_title: title,
        p_model: model,
        p_user_email: userEmail,
        p_user_name: userName
      });
      
      if (error) {
        console.error('Error saving chat with RPC:', error);
        
        // Fallback to direct insert
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            user_id: userId,
            title: title,
            model: model,
            user_email: userEmail,
            user_name: userName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();
          
        if (chatError) {
          console.error('Fallback chat insert also failed:', chatError);
          return null;
        }
        
        return chatData.id;
      }
      
      console.log('Successfully saved chat with user info');
      return data;
    } catch (error) {
      console.error('Error in saveChatWithUserInfo:', error);
      return null;
    }
  },

  // Save all user settings to the database
  async saveUserSettings(
    userId: string,
    settings: Record<string, any>
  ): Promise<boolean> {
    try {
      console.log('Saving all user settings to database...');
      
      if (!userId) {
        console.error('Cannot save settings: User ID is missing');
        return false;
      }
      
      // Get current preferences first
      const userPrefs = await this.getUserPreferences(userId);
      
      // Prepare the preferences object
      let preferences = {};
      if (userPrefs && userPrefs.preferences) {
        // Keep existing preferences
        preferences = { ...userPrefs.preferences };
      }
      
      // Add settings to preferences
      preferences = {
        ...preferences,
        settings: settings
      };
      
      // Save to database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences: preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Error saving user settings:', error);
        return false;
      }
      
      console.log('Successfully saved user settings to database');
      return true;
    } catch (error) {
      console.error('Error in saveUserSettings:', 
        error instanceof Error ? error.message : String(error));
      return false;
    }
  },
  
  // Get all chats with model information
  async getAllChats(userId: string): Promise<any[]> {
    try {
      console.log(`Fetching all chats for user ID: ${userId}`);
      
      if (!userId) {
        console.error('getAllChats: User ID is missing');
        return [];
      }
      
      // Test connection before trying to get chats
      const connectionStatus = await this.validateConnection();
      if (!connectionStatus.success) {
        console.error('Database connection test failed before fetching chats:', connectionStatus.error);
      }
      
      // Log request details for debugging
      console.log(`Making Supabase query to 'chats' table for user_id=${userId}`);
      
      const response = await supabase
        .from('chats')
        .select('id, title, model, created_at, updated_at, last_message')
        .eq('user_id', userId as any)
        .order('updated_at', { ascending: false });
      
      // Log the raw response for debugging
      console.log('Supabase response status:', response.status);
      
      if (response.error) {
        const errorDetails = {
          code: response.error.code,
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint
        };
        console.error('Error fetching chats from Supabase:', errorDetails);
        return [];
      }
      
      if (!response.data) {
        console.log('No data returned from chats query');
        return [];
      }
      
      if (response.data.length === 0) {
        console.log('No chats found for user in database');
        return [];
      }
      
      console.log(`Successfully found ${response.data.length} chats for user`);
      console.log('First chat:', response.data[0]);
      
      return response.data;
    } catch (error) {
      // Create safe error object
      const safeError = error instanceof Error 
        ? { message: error.message, name: error.name, stack: error.stack } 
        : { message: String(error) };
        
      console.error('Exception in getAllChats:', JSON.stringify(safeError));
      return [];
    }
  },
  
  // Validate database connection and table access
  async validateConnection(): Promise<{success: boolean, error?: string, tables?: any}> {
    try {
      console.log('Testing Supabase connection and table access...');
      
      // Test general connection with a simple query
      const connectionTest = await supabase.from('chats').select('count').limit(1);
      
      if (connectionTest.error) {
        return {
          success: false,
          error: `Connection error: ${connectionTest.error.message}`,
        };
      }
      
      // Check if we can access the schema information
      const tablesResponse = await supabase.rpc('get_schema_info');
      
      // Get table info using a simple query to each table
      const tables = {
        chats: await supabase.from('chats').select('count'),
        chat_messages: await supabase.from('chat_messages').select('count'),
        user_preferences: await supabase.from('user_preferences').select('count')
      };
      
      // Check for errors in any table access
      for (const [table, response] of Object.entries(tables)) {
        if (response.error) {
          return {
            success: false,
            error: `Error accessing ${table} table: ${response.error.message}`,
            tables
          };
        }
      }
      
      console.log('Database connection and table access successful');
      return {
        success: true,
        tables
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error validating connection:', errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
  },
  
  // Get messages for a specific chat
  async getChatMessages(chatId: string, userId: string): Promise<any[]> {
    try {
      console.log(`Fetching messages for chat ID: ${chatId}`);
      
      if (!chatId) {
        console.error('Cannot get chat messages: Chat ID is missing');
        return [];
      }
      
      if (!userId) {
        console.error('Cannot get chat messages: User ID is missing');
        return [];
      }
      
      // First verify the chat belongs to this user
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chatId as any)
        .eq('user_id', userId as any)
        .single();
      
      if (chatError || !chatData) {
        console.error('Error verifying chat ownership:', chatError);
        return [];
      }
      
      // Fetch the messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('chat_id', chatId as any)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log('No messages found for this chat');
        return [];
      }
      
      console.log(`Found ${data.length} messages for chat ${chatId}`);
      return data;
    } catch (error) {
      console.error('Error in getChatMessages:', 
        error instanceof Error ? error.message : String(error));
      return [];
    }
  },

  // Check if API key is valid and accessible
  async checkApiKeyStatus(provider: string, userId: string): Promise<{ valid: boolean, source: string }> {
    try {
      // First check localStorage
      let apiKey = null;
      let source = '';
      
      if (typeof window !== 'undefined') {
        try {
          const localStorageKey = `chatbuddy_api_key_${provider}_${userId}`;
          const encryptedKey = localStorage.getItem(localStorageKey);
          
          if (encryptedKey) {
            apiKey = await decryptApiKey(encryptedKey, userId);
            source = 'localStorage';
          }
        } catch (e) {
          console.warn('Error checking localStorage for API key:', e);
        }
      }
      
      // If not found in localStorage, check database
      if (!apiKey) {
        const userPreferences = await this.getUserPreferences(userId);
        
        if (userPreferences?.preferences?.api_keys?.[provider]) {
          apiKey = await decryptApiKey(userPreferences.preferences.api_keys[provider], userId);
          source = 'database.preferences';
        } else if (userPreferences?.api_keys?.[provider]) {
          apiKey = await decryptApiKey(userPreferences.api_keys[provider], userId);
          source = 'database.legacy';
        }
      }
      
      if (!apiKey) {
        return { valid: false, source: 'not_found' };
      }
      
      // Validate the key format (minimal validation)
      const isValidFormat = apiKey && apiKey.length > 10;
      
      // For extra security, we could make a test API call here if needed
      
      return { 
        valid: isValidFormat, 
        source 
      };
    } catch (error) {
      console.error('Error checking API key status:', error);
      return { valid: false, source: 'error' };
    }
  },

  // Synchronize API keys between localStorage and database
  async syncApiKeys(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        console.error('Cannot sync API keys: userId is missing');
        return false;
      }
      
      console.debug('Synchronizing API keys for user', userId);
      
      // Get API keys from database
      const userPreferences = await this.getUserPreferences(userId);
      if (!userPreferences) {
        console.warn('No user preferences found to sync');
        return false;
      }
      
      // Get database API keys from both locations
      const newFormatKeys = userPreferences.preferences?.api_keys || {};
      const legacyFormatKeys = userPreferences.api_keys || {};
      
      // Combine database keys
      const dbApiKeys = { ...legacyFormatKeys, ...newFormatKeys };
      const providers = Object.keys(dbApiKeys);
      
      // No keys to sync
      if (providers.length === 0) {
        console.debug('No API keys found in database to sync');
        return true;
      }
      
      if (typeof window === 'undefined') {
        console.debug('Not in browser environment, skipping localStorage sync');
        return true;
      }
      
      // Sync each provider's API key to localStorage
      for (const provider of providers) {
        const encryptedKey = dbApiKeys[provider];
        if (encryptedKey) {
          const localStorageKey = `chatbuddy_api_key_${provider}_${userId}`;
          localStorage.setItem(localStorageKey, encryptedKey);
          console.debug(`Synced ${provider} API key to localStorage`);
        }
      }
      
      // Check localStorage for keys not in database
      const localStorageKeys = Object.keys(localStorage).filter(
        key => key.startsWith(`chatbuddy_api_key_`) && key.endsWith(`_${userId}`)
      );
      
      for (const key of localStorageKeys) {
        // Extract provider from key format "chatbuddy_api_key_PROVIDER_USERID"
        const parts = key.split('_');
        if (parts.length >= 4) {
          const provider = parts.slice(3, parts.length - 1).join('_'); // Handle providers with underscores
          const encryptedKey = localStorage.getItem(key);
          
          // If we have a key in localStorage that's not in db, update database
          if (encryptedKey && !dbApiKeys[provider]) {
            console.debug(`Found API key in localStorage for ${provider} not in database, syncing to database`);
            
            // Update database with this key
            await this.upsertUserPreferences(userId, {
              api_keys: {
                ...dbApiKeys,
                [provider]: encryptedKey
              }
            });
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error synchronizing API keys:', error);
      return false;
    }
  },
}; 

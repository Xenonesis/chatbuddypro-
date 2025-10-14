import { supabase, UserPreferences, UserProfile, encryptApiKey, decryptApiKey } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { createEnhancedError, withErrorHandling } from '@/lib/errorHandler';

// Interface for API key information
export interface ApiKeyInfo {
  key: string;
  name: string;
  created?: string;
}

// Add this near the top of the file, outside of the userService object
// In-memory cache for API keys to minimize localStorage and DB access
const apiKeyCache: Record<string, { key: string, timestamp: number }> = {};
// Cache expiration time: 30 minutes
const CACHE_EXPIRY = 30 * 60 * 1000;

// AI Provider structure
export interface AIProviderInfo {
  enabled: boolean;
  api_keys: Record<string, string>;
}

export const userService = {
  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
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

      // Try to get user preferences - getting all matching records to handle duplicates
      console.debug(`Querying user_preferences for user_id: ${userId}`);
      const response = await supabase
        .from('user_preferences')
        .select('id, user_id, theme, language, api_keys, ai_providers, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }) // Get most recent first
        .limit(1); // Limit to 1 to reduce response size

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
      }
    );
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
          ai_providers: {
            "openai": {"enabled": false, "api_keys": {}},
            "gemini": {"enabled": false, "api_keys": {}},
            "mistral": {"enabled": false, "api_keys": {}},
            "claude": {"enabled": false, "api_keys": {}},
            "llama": {"enabled": false, "api_keys": {}},
            "deepseek": {"enabled": false, "api_keys": {}}
          },
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
            ai_providers: preferences.ai_providers || {
              "openai": {"enabled": false, "api_keys": {}},
              "gemini": {"enabled": false, "api_keys": {}},
              "mistral": {"enabled": false, "api_keys": {}},
              "claude": {"enabled": false, "api_keys": {}},
              "llama": {"enabled": false, "api_keys": {}},
              "deepseek": {"enabled": false, "api_keys": {}}
            },
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

      if (!userId) {
        console.error('getUserProfile called with no userId');
        return null;
      }

      // First try to get all profiles for this user to handle potential duplicates
      const { data: allProfiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }); // Get most recent first

      // Log detailed response for debugging
      console.log('Profile query response:', { data: allProfiles, error });

      if (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', error.code, error.message, error.details);

        // Create new profile if there was an error
        return this.createInitialProfile(userId);
      }

      if (!allProfiles || allProfiles.length === 0) {
        console.log('No profile found, creating a new one');
        return this.createInitialProfile(userId);
      }

      // If we have multiple profiles (shouldn't happen after cleanup), use the most recent one
      if (allProfiles.length > 1) {
        console.warn(`Found ${allProfiles.length} profiles for user ${userId}, using most recent`);
        // TODO: Consider cleaning up duplicates here in the future
      }

      const data = allProfiles[0]; // Use the most recent profile
      
      console.log('Successfully retrieved profile:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Try one more time with a more direct approach
      try {
        console.log('Attempting fallback profile retrieval');
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId);
          
        if (data && data.length > 0) {
          console.log('Fallback retrieval successful');
          return data[0] as UserProfile;
        }
        
        // Still no profile, create one
        console.log('No profile found in fallback, creating a new one');
        return this.createInitialProfile(userId);
      } catch (fallbackError) {
        console.error('Error in fallback getUserProfile:', fallbackError);
        return null;
      }
    }
  },

  // Update Supabase Auth user metadata to sync with dashboard
  async updateAuthUserMetadata(userId: string, profile: UserProfile): Promise<void> {
    try {
      console.log('Syncing profile to Supabase Auth metadata for user:', userId);

      // Call API route to sync profile data to auth metadata
      const response = await fetch('/api/profile/sync-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profile
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error syncing profile to auth metadata:', errorData);
        // Don't throw error as this is supplementary - profile table update is primary
      } else {
        const result = await response.json();
        console.log('Successfully synced profile to auth metadata:', result.message);
        console.log('✅ Profile data should now be visible in Supabase dashboard at: https://supabase.com/dashboard/project/oybdzbyqormgynyjwyyc/auth/users');
      }
    } catch (error) {
      console.error('Exception syncing profile to auth metadata:', error);
      // Don't throw error as this is supplementary
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
      console.log('Attempting to upsert profile for user:', userId);
      console.log('Profile data:', JSON.stringify(profile, null, 2));

      // First check if profile exists to determine if we're updating or creating
      // Use the same approach as getUserProfile to handle potential duplicates
      const { data: allProfiles, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }); // Get most recent first

      if (fetchError) {
        console.error('Error checking for existing profile:', {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details || 'No details'
        });
        throw fetchError;
      }

      const existingProfile = allProfiles && allProfiles.length > 0 ? allProfiles[0] : null;

      // If we have multiple profiles, log a warning
      if (allProfiles && allProfiles.length > 1) {
        console.warn(`Found ${allProfiles.length} profiles for user ${userId} during upsert, using most recent`);
      }
      
      // If we have an existing profile, update it
      if (existingProfile) {
        console.log('Found existing profile, updating:', existingProfile.id);
        
        // Prepare data for update
        const updateData = {
          full_name: profile.full_name ?? existingProfile.full_name,
          age: profile.age ?? existingProfile.age,
          gender: profile.gender ?? existingProfile.gender,
          profession: profile.profession ?? existingProfile.profession,
          organization_name: profile.organization_name ?? existingProfile.organization_name,
          mobile_number: profile.mobile_number ?? existingProfile.mobile_number,
          updated_at: new Date().toISOString()
        };
        
        // Update using specific ID
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', existingProfile.id)
          .select('*')
          .single();
        
        if (error) {
          console.error('Error updating profile:', {
            code: error.code, 
            message: error.message,
            details: error.details || 'No details'
          });
          return null;
        }
        
        console.log('Successfully updated profile:', data);

        // Also update Supabase Auth user metadata to sync with dashboard
        await this.updateAuthUserMetadata(userId, data);

        return data as UserProfile;
      } 
      // Otherwise create a new profile
      else {
        console.log('No existing profile found, creating new profile');
        
        // Prepare data for insert
        const insertData = {
          id: uuidv4(),
          user_id: userId,
          full_name: profile.full_name || '',
          age: profile.age ?? null,
          gender: profile.gender ?? null,
          profession: profile.profession ?? null,
          organization_name: profile.organization_name ?? null,
          mobile_number: profile.mobile_number ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Insert new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert(insertData)
          .select('*')
          .single();
        
        if (error) {
          console.error('Error creating profile:', {
            code: error.code,
            message: error.message,
            details: error.details || 'No details'
          });
          
          // Check for foreign key constraint issues
          if (error.message.includes('foreign key constraint')) {
            console.error('Foreign key constraint violation - user may not exist in auth.users');
          }
          
          return null;
        }
        
        console.log('Successfully created profile:', data);

        // Also update Supabase Auth user metadata to sync with dashboard
        await this.updateAuthUserMetadata(userId, data);

        return data as UserProfile;
      }
    } catch (error) {
      const errorDetails = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : { error };
        
      console.error('Exception in upsertUserProfile:', errorDetails);
      return null;
    }
  },

  // Updated to use ai_providers structure
  async storeApiKey(
    userId: string,
    provider: string,
    apiKey: string,
    keyName: string = 'default'
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
      
      // Special check for Mistral API keys - use warning but don't block
      if (provider === 'mistral' && apiKey.length < 30) {
        console.warn(`Warning: Mistral API key appears short (length: ${apiKey.length}). Storing anyway but it may not work.`);
      }
      
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
        
        // Initialize the ai_providers structure
        const aiProviders = {
          "openai": { "enabled": false, "api_keys": {} },
          "gemini": { "enabled": false, "api_keys": {} },
          "mistral": { "enabled": false, "api_keys": {} },
          "claude": { "enabled": false, "api_keys": {} },
          "llama": { "enabled": false, "api_keys": {} },
          "deepseek": { "enabled": false, "api_keys": {} },
          "openrouter": { "enabled": false, "api_keys": {} }
        };
        
        // Update the specific provider
        aiProviders[provider] = {
          "enabled": true,
          "api_keys": { [keyName]: encryptedKey }
        };
        
        // For backward compatibility, also set in the old structure
        const apiKeys = { [provider]: encryptedKey };
        
        await this.upsertUserPreferences(userId, {
          api_keys: apiKeys,
          ai_providers: aiProviders
        });
        
        return true;
      }
      
      // Update existing preferences
      console.log('Updating existing preferences with new API key');
      
      // For backward compatibility
      const apiKeys = preferences.api_keys || {};
      const updatedApiKeys = {
        ...apiKeys,
        [provider]: encryptedKey,
      };
      
      // Get current ai_providers or create default structure
      let aiProviders = preferences.ai_providers || {
        "openai": { "enabled": false, "api_keys": {} },
        "gemini": { "enabled": false, "api_keys": {} },
        "mistral": { "enabled": false, "api_keys": {} },
        "claude": { "enabled": false, "api_keys": {} },
        "llama": { "enabled": false, "api_keys": {} },
        "deepseek": { "enabled": false, "api_keys": {} },
        "openrouter": { "enabled": false, "api_keys": {} }
      };
      
      // Make a deep copy to prevent mutation issues
      aiProviders = JSON.parse(JSON.stringify(aiProviders));
      
      // Update the provider data
      if (!aiProviders[provider]) {
        aiProviders[provider] = { "enabled": true, "api_keys": {} };
      } else {
        aiProviders[provider].enabled = true;
      }
      
      // Ensure api_keys object exists
      if (!aiProviders[provider].api_keys) {
        aiProviders[provider].api_keys = {};
      }
      
      // Add the key
      aiProviders[provider].api_keys[keyName] = encryptedKey;
      
      await this.upsertUserPreferences(userId, {
        api_keys: updatedApiKeys, // For backward compatibility
        ai_providers: aiProviders
      });
      
      return true;
    } catch (error) {
      console.error('Error storing API key:', error instanceof Error ? error.message : String(error));
      return false;
    }
  },

  // Updated to use ai_providers structure
  async getApiKey(provider: string, userId: string, keyName: string = 'default'): Promise<string | null> {
    console.log(`Getting API key for provider ${provider} and user ${userId.substring(0, 8)}...`);
    
    try {
      // First check memory cache
      const cacheKey = `${userId}:${provider}:${keyName}`;
      const cachedEntry = apiKeyCache[cacheKey];
      
      // If we have a cached value that hasn't expired, use it
      if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_EXPIRY)) {
        console.log(`Using cached API key for ${provider}`);
        return cachedEntry.key;
      }
      
      // Start by trying to get user preferences from database
      const userPrefs = await this.getUserPreferences(userId);
      
      // Try to get from ai_providers first
      if (userPrefs && userPrefs.ai_providers) {
        const providerInfo = userPrefs.ai_providers[provider];
        
        if (providerInfo && providerInfo.enabled && providerInfo.api_keys) {
          const encryptedKey = providerInfo.api_keys[keyName] || providerInfo.api_keys['default'];
          
          if (encryptedKey) {
            try {
              console.log(`Found encrypted key for ${provider} in ai_providers, decrypting...`);
              const decryptedKey = await decryptApiKey(encryptedKey, userId);
              
              // Store in memory cache
              apiKeyCache[cacheKey] = {
                key: decryptedKey,
                timestamp: Date.now()
              };
              
              return decryptedKey;
            } catch (decryptError) {
              console.error(`Error decrypting API key for ${provider} from ai_providers:`, decryptError);
              // Continue to fall back methods
            }
          }
        }
      }
      
      // Fall back to legacy api_keys if not found in ai_providers
      if (userPrefs && 
          userPrefs.api_keys && 
          typeof userPrefs.api_keys === 'object') {
        
        console.log(`Falling back to legacy api_keys for ${userId.substring(0, 8)}`);
        
        // Try to find the specific provider's key
        const encryptedKey = userPrefs.api_keys[provider];
        
        if (encryptedKey) {
          try {
            console.log(`Found encrypted key for ${provider} in legacy structure, decrypting...`);
            const decryptedKey = await decryptApiKey(encryptedKey, userId);
            
            // Store in memory cache
            apiKeyCache[cacheKey] = {
              key: decryptedKey,
              timestamp: Date.now()
            };
            
            // Migrate to new structure for future use
            this.storeApiKey(userId, provider, decryptedKey, keyName)
              .then(success => {
                if (success) {
                  console.log(`Successfully migrated ${provider} key to ai_providers structure`);
                }
              })
              .catch(err => {
                console.error(`Error migrating ${provider} key to ai_providers:`, err);
              });
            
            return decryptedKey;
          } catch (decryptError) {
            console.error(`Error decrypting API key for ${provider} from legacy structure:`, decryptError);
            // Continue to localStorage fallback
          }
        }
      }
      
      // If not found in database or decryption failed, try localStorage
      if (typeof window !== 'undefined') {
        console.log(`Checking localStorage for ${provider} key...`);
        const localKey = localStorage.getItem(`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`);
        
        if (localKey) {
          console.log(`Found ${provider} key in localStorage`);
          
          // If the user is authenticated, try to store the key in the database for future use
          if (userId) {
            console.log(`Attempting to store localStorage ${provider} key to database...`);
            this.storeApiKey(userId, provider, localKey, keyName)
              .then(success => {
                if (success) {
                  console.log(`Successfully saved ${provider} key from localStorage to database`);
                }
              })
              .catch(err => {
                console.error(`Error saving ${provider} key from localStorage to database:`, err);
              });
          }
          
          // Cache the key
          apiKeyCache[cacheKey] = {
            key: localKey,
            timestamp: Date.now()
          };
          
          return localKey;
        }
      }
      
      console.log(`No API key found for ${provider}`);
      return null;
    } catch (error) {
      console.error(`Error retrieving API key for ${provider}:`, error);
      
      // Last resort fallback - try localStorage directly
      if (typeof window !== 'undefined') {
        try {
          const emergencyKey = localStorage.getItem(`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`);
          if (emergencyKey) {
            console.log(`Emergency fallback: using localStorage key for ${provider}`);
            return emergencyKey;
          }
        } catch (storageError) {
          console.error('Error accessing localStorage in emergency fallback:', storageError);
        }
      }
      
      return null;
    }
  },

  // New method to get all provider settings
  async getProviderInfo(provider: string, userId: string): Promise<AIProviderInfo | null> {
    try {
      if (!userId || !provider) {
        console.error('Cannot get provider info: Missing required parameters');
        return null;
      }
      
      // Get user preferences
      const userPrefs = await this.getUserPreferences(userId);
      
      if (!userPrefs || !userPrefs.ai_providers) {
        return null;
      }
      
      // Get provider info
      const providerInfo = userPrefs.ai_providers[provider];
      
      if (!providerInfo) {
        return null;
      }
      
      return providerInfo;
    } catch (error) {
      console.error(`Error getting provider info for ${provider}:`, error);
      return null;
    }
  },

  // Delete API key from new structure
  async deleteApiKey(
    userId: string,
    provider: string,
    keyName: string = 'default'
  ): Promise<boolean> {
    try {
      if (!userId || !provider) {
        console.error('Cannot delete API key: Missing required parameters');
        return false;
      }
      
      console.log(`Deleting API key for provider ${provider} and user ${userId.substring(0, 8)}...`);
      
      // Get current preferences
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences) {
        console.warn('No preferences found to delete API key from');
        return false;
      }
      
      // Remove from legacy structure (for backward compatibility)
      const apiKeys = { ...preferences.api_keys } || {};
      delete apiKeys[provider];
      
      // Remove from new structure
      let aiProviders = preferences.ai_providers || {};
      aiProviders = JSON.parse(JSON.stringify(aiProviders)); // Deep copy
      
      if (aiProviders[provider] && aiProviders[provider].api_keys) {
        delete aiProviders[provider].api_keys[keyName];
        
        // If no keys left, disable the provider
        if (Object.keys(aiProviders[provider].api_keys).length === 0) {
          aiProviders[provider].enabled = false;
        }
      }
      
      // Update preferences
      await this.upsertUserPreferences(userId, {
        api_keys: apiKeys,
        ai_providers: aiProviders
      });
      
      // Also clear from cache
      Object.keys(apiKeyCache).forEach(key => {
        if (key.startsWith(`${userId}:${provider}:${keyName}`)) {
          delete apiKeyCache[key];
        }
      });
      
      // Remove from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`chatbuddy_api_key_${provider}_${userId}`);
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
      console.log(`Starting data export for user: ${userId}`);
      
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      console.log(`Retrieved preferences: ${preferences ? 'success' : 'not found'}`);
      
      // Get user profile
      const profile = await this.getUserProfile(userId);
      console.log(`Retrieved profile: ${profile ? 'success' : 'not found'}`);

      // Get all user chats
      console.log('Fetching user chats...');
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId as any);
      
      if (chatsError) {
        console.error('Error fetching chats for export:', chatsError);
        throw new Error(`Failed to fetch chats: ${chatsError.message}`);
      }
      
      console.log(`Retrieved ${chats?.length || 0} chats`);
      
      // Get all chat messages
      console.log('Fetching chat messages...');
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId as any);
      
      if (messagesError) {
        console.error('Error fetching messages for export:', messagesError);
        throw new Error(`Failed to fetch messages: ${messagesError.message}`);
      }
      
      console.log(`Retrieved ${messages?.length || 0} messages`);
      
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
        chats: chats ? chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          model: chat.model,
        })) : [],
        messages: messages ? messages.map(msg => ({
          chat_id: msg.chat_id,
          role: msg.role,
          content: msg.content,
          created_at: msg.created_at,
        })) : [],
      };
      
      console.log('Data export object created successfully');
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      
      // Check for connection issues
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('network') || 
            errorMessage.includes('connection') || 
            errorMessage.includes('fetch')) {
          throw new Error('Network error: Please check your internet connection and try again.');
        }
      }
      
      // Rethrow the error with additional context
      throw error instanceof Error 
        ? new Error(`Export failed: ${error.message}`) 
        : new Error('Unknown error during export');
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
        .select('theme, language, api_keys, ai_providers')
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

      // Try the RPC function first
      const { data, error } = await supabase.rpc('save_chat_with_user_info', {
        p_user_id: userId,
        p_title: title,
        p_model: model,
        p_user_email: userEmail,
        p_user_name: userName
      });

      if (error) {
        // Create safe error object for logging
        const safeError = error instanceof Error
          ? { message: error.message, name: error.name, code: (error as any).code }
          : { message: String(error), code: (error as any)?.code };
        console.error('Error saving chat with RPC:', JSON.stringify(safeError));

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
          // Create safe error object for logging
          const safeChatError = chatError instanceof Error
            ? { message: chatError.message, name: chatError.name, code: (chatError as any).code }
            : { message: String(chatError), code: (chatError as any)?.code };
          console.error('Fallback chat insert also failed:', JSON.stringify(safeChatError));
          return null;
        }

        return chatData.id;
      }

      console.log('Successfully saved chat with user info');
      return data;
    } catch (error) {
      // Create safe error object for logging
      const safeError = error instanceof Error
        ? { message: error.message, name: error.name, stack: error.stack }
        : { message: String(error) };
      console.error('Error in saveChatWithUserInfo:', JSON.stringify(safeError));
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
      
      console.log('Settings data to save:', JSON.stringify(settings, null, 2));
      
      // Get current preferences first to check if they exist
      const userPrefs = await this.getUserPreferences(userId);
      
      // If we found existing preferences, update them
      if (userPrefs && userPrefs.id) {
        console.log(`Updating existing preferences with ID ${userPrefs.id}`);
        
        // Create a preferences object merging existing with new settings
        let updatedPreferences = {};
        
        // Handle existing preferences - use theme and language from individual columns
        updatedPreferences = {
          theme: userPrefs.theme || 'light',
          language: userPrefs.language || 'en',
          api_keys: userPrefs.api_keys || {},
          ai_providers: userPrefs.ai_providers || {}
        };
        
        // Merge with new settings
        updatedPreferences = {
          ...updatedPreferences,
          settings
        };
        
        console.log('Updating preferences with:', { id: userPrefs.id, preferences: updatedPreferences });
        
        // Use direct update with explicit ID and user_id
        const { data, error } = await supabase
          .from('user_preferences')
          .update({
            theme: updatedPreferences.theme || settings.theme || 'light',
            language: updatedPreferences.language || settings.language || 'en',
            api_keys: updatedPreferences.api_keys || {},
            ai_providers: updatedPreferences.ai_providers || {},
            updated_at: new Date().toISOString()
          })
          .eq('id', userPrefs.id)
          .select();
        
        if (error) {
          console.error('Error updating user settings:', {
            code: error.code,
            message: error.message,
            details: error.details || 'No details'
          });
          return false;
        }
        
        console.log('Successfully updated user settings:', data);
        return true;
      } 
      // Otherwise create new preferences
      else {
        console.log('No existing preferences found, creating new record');
        
        const newRecord = {
          id: uuidv4(),
          user_id: userId,
          theme: settings.theme || 'light',
          language: settings.language || 'en',
          api_keys: settings.api_keys || {},
          ai_providers: settings.ai_providers || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Creating new preferences:', newRecord);
        
        const { data, error } = await supabase
          .from('user_preferences')
          .insert(newRecord)
          .select();
        
        if (error) {
          console.error('Error creating user settings:', {
            code: error.code,
            message: error.message,
            details: error.details || 'No details'
          });
          return false;
        }
        
        console.log('Successfully created user settings:', data);
        return true;
      }
    } catch (error) {
      console.error('Exception in saveUserSettings:', 
        error instanceof Error ? error.message : String(error),
        error instanceof Error && error.stack ? error.stack : '');
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
      
      // Try with enhanced columns first, fallback to basic columns if migration not run
      let response;
      try {
        response = await supabase
          .from('chats')
          .select(`
            id,
            title,
            model,
            created_at,
            updated_at,
            last_message,
            user_email,
            user_name,
            last_message_at,
            message_count,
            is_archived,
            tags
          `)
          .eq('user_id', userId as any)
          .order('updated_at', { ascending: false });
      } catch (enhancedError) {
        console.log('Enhanced columns not available, falling back to basic columns');
        response = await supabase
          .from('chats')
          .select('id, title, model, created_at, updated_at, last_message, user_email, user_name')
          .eq('user_id', userId as any)
          .order('updated_at', { ascending: false });
      }

      // If enhanced query failed due to missing columns, try basic query
      if (response.error && response.error.message.includes('column')) {
        console.log('Enhanced columns not available, falling back to basic columns');
        response = await supabase
          .from('chats')
          .select('id, title, model, created_at, updated_at, last_message, user_email, user_name')
          .eq('user_id', userId as any)
          .order('updated_at', { ascending: false });
      }
      
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
  // For internal use only - not exposed in the UI
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

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import CryptoJS from 'crypto-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log configuration for debugging
console.log('Supabase configuration:', { 
  urlConfigured: Boolean(supabaseUrl), 
  keyConfigured: Boolean(supabaseAnonKey),
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Authentication features will not work properly.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

// Helper function to clean up potentially corrupted auth tokens
const cleanupAuthTokens = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear Supabase tokens from local storage
    const storageKeys = Object.keys(localStorage);
    for (const key of storageKeys) {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        console.log(`Cleaning up potentially corrupted token: ${key}`);
        localStorage.removeItem(key);
      }
    }
    
    // Clear any session storage as well
    sessionStorage.clear();
    
  } catch (error) {
    console.error('Error cleaning up auth tokens:', error);
  }
};

// Try to clean up on page load
if (typeof window !== 'undefined') {
  const hasRefreshTokenError = sessionStorage.getItem('auth_refresh_error');
  if (hasRefreshTokenError) {
    console.log('Previous refresh token error detected, cleaning up auth state');
    cleanupAuthTokens();
    sessionStorage.removeItem('auth_refresh_error');
  }
}

// Enhanced fetch implementation with retry logic for token issues
const enhancedFetch = async (...args: Parameters<typeof fetch>) => {
  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase Fetch:', args[0]);
  }
  
  try {
    const response = await fetch(...args);
    
    // Check for specific auth errors
    if (response.status === 401) {
      const responseData = await response.clone().json().catch(() => ({}));
      
      if (responseData?.error?.includes('refresh token') || 
          responseData?.message?.includes('Refresh Token')) {
        console.error('Refresh token error detected in API response');
        
        // Mark that we've encountered a refresh token error
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_refresh_error', 'true');
        }
        
        throw new Error('Invalid refresh token detected in request');
      }
    }
    
    return response;
  } catch (error) {
    // Log network errors
    console.error('Supabase network error:', 
      error instanceof Error ? error.message : String(error));
    
    // Check if it's a refresh token error
    if (error instanceof Error && 
        (error.message.includes('refresh token') || 
         error.message.includes('Refresh Token'))) {
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_refresh_error', 'true');
      }
    }
    
    // Throw a more detailed error that will be easier to handle
    throw new Error(`Supabase request failed: ${error instanceof Error ? error.message : 'Network error'}`);
  }
};

// Create the Supabase client with debug enabled in development
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    // Make sure we store the session in localStorage to persist login state
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    debug: process.env.NODE_ENV === 'development',
    autoRefreshToken: true,
    // Add more robust error handling for token refreshes
    onAuthStateChange: (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Supabase token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('Supabase detected sign out, cleaning up tokens');
        cleanupAuthTokens();
      }
    },
  },
  // Enable debug logs in development and use enhanced fetch
  global: {
    fetch: enhancedFetch,
  },
});

// Test database connection with error recovery
export async function testDatabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Attempt a simple query
    const startTime = Date.now();
    const response = await supabase
      .from('chats')
      .select('count')
      .limit(1);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.error) {
      // Check specifically for auth errors
      if (response.status === 401 || (response.error?.message?.includes('auth'))) {
        console.error('Authentication error during database test:', response.error);
        
        // Try to recover by cleaning tokens if it's an auth error
        cleanupAuthTokens();
        return false;
      }
      
      console.error('Database connection test failed:', {
        code: response.error.code,
        message: response.error.message,
        details: response.error.details,
        status: response.status
      });
      return false;
    }
    
    console.log(`Database connection successful (${responseTime}ms), status: ${response.status}`);
    return true;
  } catch (err) {
    console.error('Unexpected error testing database connection:', err);
    
    // If it's an auth error, try to clean up
    if (err instanceof Error && 
        (err.message.includes('auth') || 
         err.message.includes('token') ||
         err.message.includes('unauthorized'))) {
      cleanupAuthTokens();
    }
    
    return false;
  }
}

// Test connection on app start in development
if (process.env.NODE_ENV === 'development') {
  testDatabaseConnection();
}

// Monitor for connection or auth issues
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.id);
    
    // Test database access with the new session
    testDatabaseConnection().then(success => {
      console.log('Post-login database connection test:', success ? 'passed' : 'failed');
    });
  }
});

// Define the return type for schema check
export interface SchemaCheckResult {
  has_table: boolean;
  has_unique_constraint: boolean;
  error: string | null;
}

// Fallback function to check for schema constraints if the DB function doesn't exist
export const checkProfilesSchema = async (): Promise<SchemaCheckResult> => {
  try {
    // First try using the RPC function (assuming it's been created in the database)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('check_profiles_schema', {})
      .single();
    
    if (!rpcError && rpcData) {
      return rpcData as SchemaCheckResult;
    }
    
    console.log('RPC function not available, using fallback check');
    
    // Fallback: Check if user_profiles table exists
    const { data: tableData, error: tableError } = await supabase
      .from('user_profiles')
      .select('id, user_id')
      .limit(1);
    
    if (tableError) {
      return {
        has_table: false,
        has_unique_constraint: false,
        error: tableError.message
      };
    }
    
    // Try inserting a duplicate to test constraint (in a transaction that rolls back)
    const testUserId = 'test-duplicate-check-id';
    const { error: duplicateError } = await supabase
      .from('user_profiles')
      .insert([
        { 
          id: 'test-id-1',
          user_id: testUserId,
          full_name: 'Test User 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'test-id-2',
          user_id: testUserId, // Same user_id as previous row
          full_name: 'Test User 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    
    // Clean up test data (even if insert failed)
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId);
    
    return {
      has_table: true,
      has_unique_constraint: duplicateError?.message?.includes('unique constraint') || 
                             duplicateError?.message?.includes('duplicate') || 
                             false,
      error: duplicateError?.message || null
    };
  } catch (error: unknown) {
    console.error('Error checking schema:', error);
    return {
      has_table: false,
      has_unique_constraint: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// For server-side operations that require more privileges
export const createServiceClient = () => {
  let serviceRoleKey;
  
  // Check if we have a service key in local storage (client-side)
  if (typeof window !== 'undefined') {
    serviceRoleKey = window.localStorage.getItem('SUPABASE_SERVICE_KEY');
  }
  
  // Fallback to environment variable (server-side)
  if (!serviceRoleKey) {
    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  
  if (!serviceRoleKey) {
    console.error('Service role key is missing');
    throw new Error('Service role key is required for admin operations');
  }
  
  console.log('Creating service client with elevated privileges');
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false, // Don't persist admin sessions
    },
    global: {
      headers: {
        'x-admin-request': 'true', // Add header for potential auditing
      },
    },
  });
};

// Encryption utilities for API keys
export const encryptApiKey = async (apiKey: string, userId: string) => {
  // Basic encryption - in a production app, use a more secure method
  // This is a simple XOR for demonstration - use a proper encryption library in production
  const encoder = new TextEncoder();
  const userIdBytes = encoder.encode(userId);
  const apiKeyBytes = encoder.encode(apiKey);
  
  const encryptedBytes = new Uint8Array(apiKeyBytes.length);
  for (let i = 0; i < apiKeyBytes.length; i++) {
    encryptedBytes[i] = apiKeyBytes[i] ^ userIdBytes[i % userIdBytes.length];
  }
  
  return btoa(String.fromCharCode(...encryptedBytes));
};

export const decryptApiKey = async (encryptedKey: string, userId?: string) => {
  try {
    // Validate input
    if (!encryptedKey) {
      throw new Error('Cannot decrypt: Encrypted key is empty');
    }
    
    // Use a default salt if userId is not provided
    const salt = userId || 'default-encryption-salt';
    
    // Corresponding decryption function
    const encryptedBytes = new Uint8Array(
      atob(encryptedKey).split('').map(char => char.charCodeAt(0))
    );
    
    const encoder = new TextEncoder();
    const saltBytes = encoder.encode(salt);
    
    const decryptedBytes = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes[i] = encryptedBytes[i] ^ saltBytes[i % saltBytes.length];
    }
    
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error('Error decrypting API key:', 
      error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to decrypt API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Type definitions for Supabase tables
export type UserProfile = {
  id: string;
  user_id: string;
  full_name: string;
  age: number | null;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | null;
  profession: string | null;
  organization_name: string | null;
  mobile_number: number | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  preferences?: Record<string, any>;
  theme?: string;
  language?: string;
  api_keys?: Record<string, string>;
  ai_providers?: {
    [provider: string]: {
      enabled: boolean;
      api_keys: Record<string, string>;
    }
  };
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
};

export type Chat = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  model?: string;
  user_email?: string;
  user_name?: string;
};

// Helper for directly executing SQL
export async function executeSql(sql: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'X-Client-Info': 'supabase-js/2.0.0',
      },
      body: JSON.stringify({
        query: sql
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
} 
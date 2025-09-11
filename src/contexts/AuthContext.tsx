'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthReady: boolean;
  refreshAuth: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const authInitializedRef = useRef(false);
  const { toast } = useToast();

  // Method to handle authentication errors
  const handleAuthError = useCallback((error: any) => {
    console.error('Auth error:', error);
    
    // Check if it's a refresh token error
    if (error?.message?.includes('Refresh Token') || 
        error?.message?.includes('Invalid Refresh Token') ||
        error?.name === 'AuthApiError') {
      
      console.log('Detected refresh token issue - clearing session');
      
      // Clear any potentially corrupted tokens
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('sb-gphdrsfbypnckxbdjjap-auth-token');
          sessionStorage.clear();
          
          // Clear any auth cookies
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.trim().split('=');
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
          
          toast({
            title: 'Session expired',
            description: 'Please sign in again',
            variant: 'destructive'
          });
        } catch (err) {
          console.error('Error clearing auth data:', err);
        }
      }
      
      // Reset auth state
      setUser(null);
      setSession(null);
    }
  }, [toast]);

  useEffect(() => {
    console.log('AuthProvider mounted, initializing auth state');
    
    if (authInitializedRef.current) {
      console.log('Auth already initialized, skipping');
      return;
    }
    
    authInitializedRef.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setSession(null);
        } else if (data.session) {
          console.log('✅ Session found:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log('No session found');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
        setIsAuthReady(true);
        console.log('✅ Auth initialization complete');
      }
    };
    
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT') {
          // Clear local storage and session storage on sign out
          try {
            localStorage.removeItem('sb-gphdrsfbypnckxbdjjap-auth-token');
            sessionStorage.clear();
          } catch (err) {
            console.error('Error clearing storage on sign out:', err);
          }
        }
        
        // Always update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        // Ensure auth is marked as ready
        if (!isAuthReady) {
          setIsAuthReady(true);
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Signed in',
            description: `Welcome back, ${currentSession?.user?.email}`,
          });
          
          // Force redirect to dashboard on sign in
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
          
          // Ensure user profile exists for OAuth users (async but non-blocking)
          if (currentSession?.user?.id) {
            ensureUserProfileExists(currentSession.user.id, currentSession.user).catch(error => {
              console.error('Error ensuring user profile exists:', error);
            });
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Signed out',
            description: 'You have been signed out successfully',
          });
        }
      }
    );

    return () => {
      console.log('AuthProvider unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [handleAuthError, toast]);

  // Function to ensure user profile exists (especially important for OAuth users)
  const ensureUserProfileExists = async (userId: string, user: any) => {
    try {
      console.log('Ensuring user profile exists for:', userId);
      
      // Check if user profile already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', profileError);
        return;
      }
      
      // Create profile if it doesn't exist
      if (!existingProfile) {
        console.log('Creating user profile for OAuth user:', userId);
        
        // Extract name from user metadata (common for OAuth providers)
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        '';
        
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            full_name: fullName,
            age: null,
            gender: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          console.log('Successfully created user profile for OAuth user');
        }
      }
      
      // Check if user preferences exist
      const { data: existingPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (prefsError && prefsError.code !== 'PGRST116') {
        console.error('Error checking existing preferences:', prefsError);
        return;
      }
      
      // Create preferences if they don't exist
      if (!existingPrefs) {
        console.log('Creating user preferences for OAuth user:', userId);
        
        const { error: createPrefsError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            theme: 'light',
            language: 'en',
            api_keys: {},
            ai_providers: {
              "openai": { "enabled": false, "api_keys": {} },
              "gemini": { "enabled": false, "api_keys": {} },
              "mistral": { "enabled": false, "api_keys": {} },
              "claude": { "enabled": false, "api_keys": {} },
              "llama": { "enabled": false, "api_keys": {} },
              "deepseek": { "enabled": false, "api_keys": {} }
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (createPrefsError) {
          console.error('Error creating user preferences:', createPrefsError);
        } else {
          console.log('Successfully created user preferences for OAuth user');
        }
      }
      
    } catch (error) {
      console.error('Error in ensureUserProfileExists:', error);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Attempting signup for:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        console.error('Signup error:', error);
      } else {
        console.log('Signup successful:', data);
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { data: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting signin for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
      } else {
        console.log('Signin successful:', data.user?.id);
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected signin error:', error);
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    console.log('Attempting signout');
    try {
      // First clear local storage to avoid any token issues
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('sb-gphdrsfbypnckxbdjjap-auth-token');
          
          // Clear all localStorage items related to Supabase
          const storageKeys = Object.keys(localStorage);
          for (const key of storageKeys) {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          }
          
          sessionStorage.clear();
          
          // Clear any auth cookies
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.trim().split('=');
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        } catch (err) {
          console.error('Error clearing browser storage during signout:', err);
        }
      }
      
      // Then call the actual signOut method
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during supabase.auth.signOut():', error);
        
        // Even if there's an error, we should reset the client side auth state
        setUser(null);
        setSession(null);
        
        // Force reset auth state by reloading the page in extreme cases
        if (error.message?.includes('refresh token')) {
          console.log('Detected refresh token issue during signout, forcing page reload');
          window.location.href = '/auth/login';
        }
      } else {
        console.log('Supabase signOut successful');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Unexpected error during signOut:', error);
      
      // Still reset client-side auth state even on error
      setUser(null);
      setSession(null);
    }
  };

  const resetPassword = async (email: string) => {
    console.log('Attempting password reset for:', email);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
      } else {
        console.log('Password reset email sent');
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      return { data: null, error: error as Error };
    }
  };

  const refreshAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing auth:', error);
        setUser(null);
        setSession(null);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
    } catch (error) {
      console.error('Unexpected error refreshing auth:', error);
      setUser(null);
      setSession(null);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthReady,
    refreshAuth,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to wait for auth initialization
export function useWaitForAuth() {
  const { isAuthReady, isLoading } = useAuth();
  return { isAuthReady, isLoading };
} 
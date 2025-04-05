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
    // Log that auth provider has mounted
    console.log('AuthProvider mounted, initializing auth state');
    
    if (authInitializedRef.current) {
      console.log('Auth already initialized, skipping');
      return;
    }
    
    authInitializedRef.current = true;
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization');
        
        // Try to get the session, with error handling
        let sessionResult;
        try {
          sessionResult = await supabase.auth.getSession();
        } catch (error) {
          console.error('Error during getSession:', error);
          handleAuthError(error);
          setIsLoading(false);
          setIsAuthReady(true);
          return;
        }
        
        const { data, error } = sessionResult;
        
        if (error) {
          console.error('Error getting session:', error);
          handleAuthError(error);
          setIsLoading(false);
          setIsAuthReady(true);
          return;
        }
        
        if (data.session) {
          console.log('Session found on initialization:', data.session.user.id);
          setSession(data.session);
          setUser(data.session.user);
          
          // Test by getting the user object
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error('Error fetching user:', userError);
              handleAuthError(userError);
              // Clear session if user fetch fails
              setUser(null);
              setSession(null);
            } else {
              console.log('User from getUser:', userData?.user?.id);
              // Make sure we have the most up-to-date user
              setUser(userData?.user || null);
            }
          } catch (userFetchError) {
            console.error('Unexpected error fetching user:', userFetchError);
            handleAuthError(userFetchError);
          }
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Unexpected error in auth initialization:', error);
        handleAuthError(error);
      } finally {
        setIsLoading(false);
        setIsAuthReady(true);
        console.log('Auth initialization complete');
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
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Signed in',
            description: `Welcome back, ${currentSession?.user?.email}`,
          });
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
        console.log('Signup successful, verification needed:', data);
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
          sessionStorage.clear();
        } catch (err) {
          console.error('Error clearing storage on sign out:', err);
        }
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        handleAuthError(error);
        
        // Even if there's an error, reset the local state
        setUser(null);
        setSession(null);
        
        throw error;
      }
      
      console.log('Signout successful');
    } catch (error) {
      console.error('Unexpected signout error:', error);
      
      // Force reset auth state even on error
      setUser(null);
      setSession(null);
      
      throw error;
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

  const value = {
    user,
    session,
    isLoading,
    isAuthReady,
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
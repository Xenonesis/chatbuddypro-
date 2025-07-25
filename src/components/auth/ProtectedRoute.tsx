'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedLoading from '@/components/ui/enhanced-loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady || isLoading) return;

    if (requireAuth && !user) {
      // Store the current path to redirect back after login
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = new URL(redirectTo, window.location.origin);
      if (currentPath !== '/') {
        loginUrl.searchParams.set('redirectTo', currentPath);
      }
      router.push(loginUrl.toString());
    }
  }, [user, isLoading, isAuthReady, requireAuth, redirectTo, router]);

  // Show loading while auth is initializing
  if (!isAuthReady || isLoading) {
    return (
      <EnhancedLoading
        type="auth"
        message="Checking Authentication"
        submessage="Please wait while we verify your session..."
      />
    );
  }

  // If auth is required but user is not authenticated, show loading
  // (the redirect will happen in useEffect)
  if (requireAuth && !user) {
    return (
      <EnhancedLoading
        type="auth"
        message="Redirecting to Login"
        submessage="Please wait while we redirect you..."
      />
    );
  }

  // If auth is not required or user is authenticated, render children
  return <>{children}</>;
}
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Configure this page to be static
export const dynamic = 'force-static';

// Loading component for Suspense
function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Processing Login...</h1>
        <p className="text-center text-muted-foreground">Please wait while we complete your authentication.</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}

// Auth callback content component that uses searchParams
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const code = searchParams.get('code');
    const redirectTo = searchParams.get('redirectTo');
    
    async function handleCallback() {
      if (code) {
        try {
          // Exchange the code for a session
          await supabase.auth.exchangeCodeForSession(code);
          // Redirect to the specified path or dashboard after successful authentication
          const destination = redirectTo && redirectTo !== '/' ? redirectTo : '/dashboard';
          router.push(destination);
        } catch (error) {
          console.error('Error in auth callback:', error);
          router.push('/auth/login?error=callback_error');
        }
      } else {
        // No code provided, redirect to login
        router.push('/auth/login');
      }
    }

    handleCallback();
  }, [router, searchParams, supabase.auth]);

  return <LoadingState />;
}

// Main page component with Suspense
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthCallbackContent />
    </Suspense>
  );
} 
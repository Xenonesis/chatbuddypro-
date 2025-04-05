'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthReady) return;

    // If user is already authenticated and trying to access auth pages,
    // redirect to dashboard
    if (user && 
        (pathname?.includes('/login') || 
         pathname?.includes('/signup'))) {
      console.log('User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [isAuthReady, user, router, pathname]);

  return <>{children}</>;
} 
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthReady, user, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 
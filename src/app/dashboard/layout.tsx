'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useApiKeySync from '@/components/hooks/useApiKeySync';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Use the API key sync hook
  useApiKeySync();
  
  // Check authentication
  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/auth/login');
    } else {
      setLoading(false);
    }
  }, [isAuthReady, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4 pt-24">
        {children}
      </div>
    </div>
  );
} 
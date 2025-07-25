'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfileRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/settings');
  }, [router]);
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-600 dark:text-slate-400">
            Redirecting to profile settings...
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
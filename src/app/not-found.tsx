'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon, Settings, MessageSquare, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-4">
      <div className="bg-slate-900 rounded-full p-8 mb-6">
        <div className="text-6xl sm:text-8xl font-bold text-white">404</div>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        Page Not Found
      </h1>
      
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 min-w-[160px]">
            <HomeIcon className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </Link>
        
        <Link href="/settings">
          <Button variant="outline" className="min-w-[160px]">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
      
      <div className="mt-12 text-sm text-slate-500 dark:text-slate-400">
        <p>Looking for the chat? <Link href="/" className="text-blue-600 dark:text-blue-400 underline">Start a conversation</Link></p>
      </div>
    </div>
  );
} 
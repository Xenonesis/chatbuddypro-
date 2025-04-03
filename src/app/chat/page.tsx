"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);
  
  return (
    <div className="container mx-auto py-8 px-4 text-center">
      <div className="animate-pulse">Redirecting to chat...</div>
    </div>
  );
} 
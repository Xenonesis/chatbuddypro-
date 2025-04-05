'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ChatHistory from '@/components/ChatHistory';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Settings, LogOut, Database } from 'lucide-react';
import Link from 'next/link';
import { userService } from '@/lib/services/userService';
import { testDatabaseConnection } from '@/lib/supabase';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<string>('Checking database...');

  useEffect(() => {
    // Only test database connection in development
    if (process.env.NODE_ENV === 'development') {
      testDatabaseConnection().then(success => {
        setDbStatus(success ? 'Database connected' : 'Database connection failed');
      });
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/chat">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </Link>
          {process.env.NODE_ENV === 'development' && user && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 ml-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900"
              onClick={async () => {
                if (!user) return;
                try {
                  const chatId = await userService.saveChatWithUserInfo(
                    user.id,
                    'Test Chat ' + new Date().toLocaleTimeString(),
                    'gpt-3.5-turbo',
                    user.email || 'unknown@example.com',
                    user.user_metadata?.name || 'Test User'
                  );
                  
                  if (chatId) {
                    alert('Test chat created! ID: ' + chatId);
                    // Force refresh of the chat history component
                    window.location.reload();
                  } else {
                    alert('Failed to create test chat');
                  }
                } catch (error) {
                  console.error('Error creating test chat:', error);
                  alert('Error: ' + (error instanceof Error ? error.message : String(error)));
                }
              }}
            >
              <span>Create Test Chat</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Conversations
              </h2>
              <div className="flex items-center gap-2">
                <Link href="/chat">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
                {process.env.NODE_ENV === 'development' && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    dbStatus.includes('connected') 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {dbStatus}
                  </span>
                )}
              </div>
            </div>
            <div className="h-[70vh]">
              <ChatHistory />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-4">
          <div className="bg-card p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/chat" className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </Link>
              <Link href="/admin" className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              {process.env.NODE_ENV === 'development' && (
                <Link href="/debug" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Debug Tools
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            {user && (
              <div>
                <p className="text-sm text-muted-foreground">Signed in as:</p>
                <p className="font-medium">{user.email}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Manage Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-red-50 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 w-full justify-start"
                    onClick={async () => {
                      try {
                        // Clear any potentially corrupted tokens
                        localStorage.removeItem('sb-gphdrsfbypnckxbdjjap-auth-token');
                        await signOut();
                        router.push('/auth/login');
                      } catch (error) {
                        console.error('Error signing out:', error);
                        // Force reload to clear any stuck state
                        window.location.href = '/auth/login';
                      }
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out & Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
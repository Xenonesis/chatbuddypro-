'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ChatHistory from '@/components/ChatHistory';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Settings, LogOut, RefreshCw, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { testDatabaseConnection } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dbStatus, setDbStatus] = useState<string>('Checking database...');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Only test database connection in development
    if (process.env.NODE_ENV === 'development') {
      testDatabaseConnection().then(success => {
        setDbStatus(success ? 'Database connected' : 'Database connection failed');
      });
    }
    
    // Check if the user was redirected with an error message
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get('error');
    if (errorMsg) {
      toast({
        title: "Error",
        description: decodeURIComponent(errorMsg),
        variant: "destructive"
      });
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      // Clear any potentially corrupted tokens
      localStorage.removeItem('sb-gphdrsfbypnckxbdjjap-auth-token');
      
      // Clear all Supabase-related items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload to clear any stuck state
      window.location.href = '/auth/login?error=' + encodeURIComponent('Error during sign out. Session has been reset.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                {process.env.NODE_ENV === 'development' && dbStatus.includes('connected') && (
                  <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100/10 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {dbStatus}
                  </div>
                )}
              </div>
            </div>
            <div className="h-[70vh] overflow-hidden">
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
              <Link href="/settings" className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Profile Settings
                </Button>
              </Link>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              {user && (
                <div>
                  <p className="text-sm text-muted-foreground">Signed in as:</p>
                  <p className="font-medium">{user.email}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/settings">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Manage Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-700 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 w-full justify-start"
                      disabled={isSigningOut}
                      onClick={handleSignOut}
                    >
                      {isSigningOut ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <LogOut className="h-4 w-4 mr-2" />
                      )}
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
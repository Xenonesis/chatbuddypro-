'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import ChatHistory from '@/components/ChatHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function DebugPage() {
  const { user } = useAuth();
  const [dbStatus, setDbStatus] = useState<{success: boolean, error?: string, tables?: any}>();
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      checkDatabaseConnection();
    }
  }, [user]);

  const checkDatabaseConnection = async () => {
    setLoading(true);
    try {
      const status = await userService.validateConnection();
      setDbStatus(status);
      console.log('Database connection status:', status);
    } catch (error) {
      console.error('Error checking database connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatCreated = () => {
    // Refresh the chat history by incrementing the key
    setRefreshKey(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">You need to be logged in to access the debug tools.</p>
          <Link href="/auth/login">
            <Button className="mx-auto">Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Debug Tools</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm">Logged in as: {user.email}</p>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbStatus ? (
                <div className={`p-4 rounded-md ${
                  dbStatus.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <h3 className={`font-medium ${
                    dbStatus.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                  }`}>
                    Status: {dbStatus.success ? 'Connected' : 'Error'}
                  </h3>
                  {dbStatus.error && (
                    <p className="mt-2 text-sm text-red-800 dark:text-red-300">{dbStatus.error}</p>
                  )}
                  {dbStatus.tables && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Tables:</h4>
                      <ul className="text-sm space-y-1">
                        {Object.entries(dbStatus.tables).map(([table, response]: [string, any]) => (
                          <li key={table} className="flex justify-between">
                            <span>{table}</span>
                            <span className={`px-2 rounded ${
                              response.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {response.error ? 'Error' : 'OK'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="ml-2">Testing connection...</p>
                    </div>
                  ) : (
                    <p>No connection test performed yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Debug Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Debug tools have been temporarily disabled. Use the chat history above to test functionality.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Chat History</CardTitle>
            </CardHeader>
            <CardContent className="h-[70vh]">
              <ChatHistory key={refreshKey} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
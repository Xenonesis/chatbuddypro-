'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Database, AlertTriangle, Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  const { user, isAuthReady } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [adminMode, setAdminMode] = useState(false);
  const [serviceKey, setServiceKey] = useState('');
  const [serviceKeyVisible, setServiceKeyVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeys, setShowApiKeys] = useState(false);

  useEffect(() => {
    if (isAuthReady && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [isAuthReady, user, router]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load chats
      if (!user || !user.id) {
        console.error('User is not available');
        setIsLoading(false);
        return;
      }
      
      const chatData = await userService.getAllChats(user.id);
      setChats(chatData);
      
      // Load API keys for all providers
      const openaiKey = await userService.getApiKeyByName(user.id, 'openai', 'openai');
      const anthropicKey = await userService.getApiKeyByName(user.id, 'anthropic', 'anthropic');
      const googleKey = await userService.getApiKeyByName(user.id, 'google', 'google');
      const mistralKey = await userService.getApiKeyByName(user.id, 'mistral', 'mistral');
      const keys: Record<string, string> = {};
      
      if (openaiKey) {
        keys['openai'] = openaiKey.key;
      }
      if (anthropicKey) {
        keys['claude'] = anthropicKey.key;
      }
      if (googleKey) {
        keys['gemini'] = googleKey.key;
      }
      if (mistralKey) {
        keys['mistral'] = mistralKey.key;
      }
      
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelDisplayName = (modelId: string) => {
    const modelMap: Record<string, string> = {
      'gpt-4': 'GPT-4 (OpenAI)',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo (OpenAI)',
      'gemini-2.0-flash': 'Gemini 2.0 Flash (Google)',
      'claude-3-opus': 'Claude 3 Opus (Anthropic)',
      'claude-3-sonnet': 'Claude 3 Sonnet (Anthropic)',
      'mistral-medium': 'Mistral Medium',
      'mistral-small': 'Mistral Small',
      'llama-2': 'Llama 2 (Meta)',
      'deepseek-coder': 'DeepSeek Coder'
    };
    
    return modelMap[modelId] || modelId;
  };

  const handleToggleAdminMode = (enabled: boolean) => {
    setAdminMode(enabled);
    
    if (enabled) {
      if (!serviceKey) {
        toast({
          title: 'Service Key Required',
          description: 'You need to provide a Supabase service role key to enable admin mode',
          variant: 'destructive',
        });
        setAdminMode(false);
        return;
      }
      
      // Save to local storage
      localStorage.setItem('SUPABASE_ADMIN_MODE', 'true');
      localStorage.setItem('SUPABASE_SERVICE_KEY', serviceKey);
      
      toast({
        title: 'Admin Mode Enabled',
        description: 'You now have elevated privileges for database operations',
      });
    } else {
      // Remove from local storage
      localStorage.removeItem('SUPABASE_ADMIN_MODE');
      localStorage.removeItem('SUPABASE_SERVICE_KEY');
      
      toast({
        title: 'Admin Mode Disabled',
        description: 'You are now using standard user permissions',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="animate-pulse">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only show admin interface for authenticated users
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Admin Panel
            </CardTitle>
            <CardDescription>
              You need to be signed in to access admin features
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/auth/login">
              <Button>
                Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Admin Panel
                </CardTitle>
                <CardDescription>
                  Enable admin mode for advanced database operations
                </CardDescription>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-400">Warning</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Admin mode bypasses Row Level Security (RLS) policies and gives you full access to the database.
                  This should only be used for debugging and administrative tasks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-mode" className="flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-500" />
                Admin Mode
              </Label>
              <Switch
                id="admin-mode"
                checked={adminMode}
                onCheckedChange={handleToggleAdminMode}
              />
            </div>
            <p className="text-sm text-slate-500">
              When enabled, database operations will use a service role key to bypass RLS policies
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-key" className="flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-500" />
              Supabase Service Role Key
            </Label>
            <div className="flex gap-2">
              <Input
                id="service-key"
                type={serviceKeyVisible ? "text" : "password"}
                placeholder="eyJh..."
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                type="button"
                onClick={() => setServiceKeyVisible(!serviceKeyVisible)}
              >
                {serviceKeyVisible ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              This key is stored locally in your browser and is never sent to our servers
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.removeItem('SUPABASE_ADMIN_MODE');
              localStorage.removeItem('SUPABASE_SERVICE_KEY');
              setAdminMode(false);
              setServiceKey('');
              toast({
                title: 'Settings Reset',
                description: 'Admin mode has been disabled and service key removed',
              });
            }}
          >
            Reset
          </Button>
          <Button 
            onClick={() => {
              if (adminMode && !serviceKey) {
                toast({
                  title: 'Service Key Required',
                  description: 'Please enter a service role key to enable admin mode',
                  variant: 'destructive',
                });
                return;
              }
              
              handleToggleAdminMode(adminMode);
              toast({
                title: adminMode ? 'Settings Saved' : 'Settings Updated',
                description: adminMode 
                  ? 'Admin mode settings have been saved' 
                  : 'Admin mode has been disabled',
              });
            }}
          >
            Save Settings
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your API Keys</h2>
        <button 
          onClick={() => setShowApiKeys(!showApiKeys)}
          className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
        >
          {showApiKeys ? 'Hide API Keys' : 'Show API Keys'}
        </button>
        
        {showApiKeys && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            {Object.entries(apiKeys).map(([provider, key]) => (
              <div key={provider} className="mb-2">
                <span className="font-semibold">{provider.charAt(0).toUpperCase() + provider.slice(1)}:</span>{' '}
                <span className="font-mono">{key ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : 'Not set'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Chats ({chats.length})</h2>
        {chats.length === 0 ? (
          <p>No chats found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.map(chat => (
              <div key={chat.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-bold truncate">{chat.title || 'Untitled Chat'}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Model: {getModelDisplayName(chat.model)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {formatDistanceToNow(new Date(chat.created_at))} ago
                </div>
                {chat.last_message && (
                  <div className="mt-2 text-sm truncate text-gray-700 dark:text-gray-300">
                    Last message: {chat.last_message}
                  </div>
                )}
                <div className="mt-4">
                  <button 
                    onClick={() => router.push(`/chat?id=${chat.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
} 
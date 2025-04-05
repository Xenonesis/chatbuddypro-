import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Clock, Database, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatHistory() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean, error?: string}>({success: false});
  const [showConnectionTest, setShowConnectionTest] = useState(false);

  useEffect(() => {
    console.log('ChatHistory component mounted, user:', user ? 'authenticated' : 'not authenticated');
    
    if (user) {
      console.log('User is authenticated, ID:', user.id);
      loadChatHistory();
    } else {
      console.log('No user available in ChatHistory');
      setDebugInfo('Not authenticated or user session is missing');
      setIsLoading(false);
    }
  }, [user]);

  const testDatabaseConnection = async () => {
    setDebugInfo('Testing database connection...');
    try {
      const status = await userService.validateConnection();
      setConnectionStatus(status);
      
      if (status.success) {
        setDebugInfo('Database connection successful! Tables accessible.');
      } else {
        setDebugInfo(`Connection error: ${status.error}`);
      }
      
      console.log('Connection test result:', status);
      setShowConnectionTest(true);
      return status.success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDebugInfo(`Error testing connection: ${errorMsg}`);
      setConnectionStatus({success: false, error: errorMsg});
      setShowConnectionTest(true);
      return false;
    }
  };

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      if (!user || !user.id) {
        console.error('No valid user ID available');
        setDebugInfo('User ID is missing or invalid');
        setIsLoading(false);
        return;
      }
      
      console.log('Loading chat history for user ID:', user.id);
      
      // Test connection first
      const connectionOk = await testDatabaseConnection();
      if (!connectionOk) {
        console.warn('Database connection test failed, but will try to load chats anyway');
      }
      
      // Add a delay to ensure auth is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chatData = await userService.getAllChats(user.id);
      console.log('Chat data received:', chatData);
      setChats(chatData);
      
      if (chatData.length === 0) {
        setDebugInfo(prev => prev + '\nNo chats found for this user. Try creating a new chat.');
      } else {
        setDebugInfo(prev => prev + `\nFound ${chatData.length} chats`);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to manually fetch chats for debugging
  const retryLoadChats = async () => {
    if (!user) {
      setDebugInfo('Cannot load chats: No user authenticated');
      return;
    }
    
    setDebugInfo('Retrying chat load...');
    await loadChatHistory();
  };

  const getModelDisplayName = (modelId: string) => {
    const modelMap: Record<string, string> = {
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5',
      'gemini-pro': 'Gemini Pro',
      'claude-3-opus': 'Claude 3 Opus',
      'claude-3-sonnet': 'Claude 3 Sonnet',
      'mistral-medium': 'Mistral Medium',
      'mistral-small': 'Mistral Small',
      'llama-2': 'Llama 2',
      'deepseek-coder': 'DeepSeek Coder'
    };
    
    return modelMap[modelId] || modelId;
  };

  const filteredChats = chats.filter(
    chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Sign in to view your chat history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat History
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto" style={{ maxHeight: "calc(100vh - 240px)" }}>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-2 p-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No chats found matching your search" : "No chat history yet"}
            {debugInfo && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded-md">
                <pre className="whitespace-pre-wrap">Debug: {debugInfo}</pre>
              </div>
            )}
            {showConnectionTest && (
              <div className={`mt-2 p-2 text-xs rounded-md ${
                connectionStatus.success 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                <p className="font-medium">Database Connection: {connectionStatus.success ? 'OK' : 'Failed'}</p>
                {connectionStatus.error && <p>{connectionStatus.error}</p>}
              </div>
            )}
            <div className="flex gap-2 justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryLoadChats}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Chats
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={testDatabaseConnection}
              >
                <Database className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div 
              key={chat.id}
              className="border rounded-lg p-3 hover:bg-accent hover:cursor-pointer transition-colors"
              onClick={() => router.push(`/chat?id=${chat.id}`)}
            >
              <div className="font-medium truncate">{chat.title || 'Untitled chat'}</div>
              <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                <span className="bg-primary/10 px-2 py-0.5 rounded-full">{getModelDisplayName(chat.model)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(chat.created_at))} ago
                </span>
              </div>
              {chat.last_message && (
                <div className="mt-1 text-sm text-muted-foreground truncate">
                  {chat.last_message}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
} 
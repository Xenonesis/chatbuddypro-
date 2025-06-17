import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquarePlus } from 'lucide-react';

export function CreateTestChat({ onChatCreated }: { onChatCreated?: (chatId: string) => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(`Test Chat ${new Date().toLocaleTimeString()}`);
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{success?: boolean, message: string, chatId?: string}>({ message: '' });

  const handleCreateChat = async () => {
    if (!user) {
      setResult({
        success: false,
        message: 'Not authenticated. Please sign in.',
      });
      return;
    }

    try {
      setIsCreating(true);
      setResult({ message: 'Creating test chat...' });

      const chatId = await userService.saveChatWithUserInfo(
        user.id,
        title,
        model,
        user.email || 'unknown@example.com',
        user.user_metadata?.name || 'Test User'
      );

      if (chatId) {
        setResult({
          success: true,
          message: `Test chat created successfully! ID: ${chatId}`,
          chatId
        });
        
        if (onChatCreated) {
          onChatCreated(chatId);
        }
      } else {
        setResult({
          success: false,
          message: 'Failed to create test chat. Unknown error.'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
      console.error('Error creating test chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { id: 'gemini-pro', name: 'Gemini Pro' },
  ];

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-medium mb-4">Create Test Chat</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chat-title">Chat Title</Label>
          <Input
            id="chat-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chat title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="chat-model">Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="chat-model">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleCreateChat} 
          disabled={isCreating || !user}
          className="w-full"
        >
          {isCreating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              Creating...
            </>
          ) : (
            <>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Create Test Chat
            </>
          )}
        </Button>
        
        {result.message && (
          <div className={`mt-2 p-2 text-sm rounded ${
            result.success === undefined 
              ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
              : result.success
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
} 
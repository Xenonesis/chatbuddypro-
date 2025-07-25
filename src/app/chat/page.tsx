"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import Chat from '@/components/Chat';
import EnhancedLoading from '@/components/ui/enhanced-loading';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');
  const { user, isAuthReady } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [chatTitle, setChatTitle] = useState('');
  const [chatModel, setChatModel] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    console.log('ChatPage mounted', { isAuthReady, user, chatId });
    
    if (!isAuthReady) return;

    // If not logged in and trying to access a specific chat, redirect to login
    if (!user && chatId) {
      router.push('/auth/login');
      return;
    }

    // If we have a chatId and user is logged in, load chat data
    if (chatId && user) {
      loadChatData();
    } else {
      // For new chats, just mark as not loading
      setIsLoading(false);
    }
  }, [isAuthReady, user, chatId]);

  const loadChatData = async () => {
    setIsLoading(true);
    try {
      // First get the chat messages
      const chatMessages = await userService.getChatMessages(chatId!, user!.id);
      setMessages(chatMessages);

      // Also fetch chat metadata (title, model)
      const chats = await userService.getAllChats(user!.id);
      const currentChat = chats.find(chat => chat.id === chatId);
      
      if (currentChat) {
        setChatTitle(currentChat.title || 'Untitled Chat');
        setChatModel(currentChat.model || '');
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <EnhancedLoading
        type="chat"
        message="Loading Chat"
        submessage="Preparing your conversation..."
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-2 sm:py-4 px-2 sm:px-4 lg:px-8 flex flex-col min-h-[calc(100vh-64px)] max-w-7xl pb-20 md:pb-4">
        <Chat 
          initialMessages={messages} 
          initialTitle={chatTitle}
          initialModel={chatModel}
          chatId={chatId || undefined}
        />
      </div>
    </ProtectedRoute>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <EnhancedLoading
        type="chat"
        message="Loading Chat"
        submessage="Preparing your conversation..."
      />
    }>
      <ChatPageContent />
    </Suspense>
  );
} 
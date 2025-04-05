"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services/userService';
import Chat from '@/components/Chat';

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
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 flex flex-col min-h-[calc(100vh-64px)]">
      <Chat 
        initialMessages={messages} 
        initialTitle={chatTitle}
        initialModel={chatModel}
        chatId={chatId || undefined}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading chat...</p>
        </div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
} 
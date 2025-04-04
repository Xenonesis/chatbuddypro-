'use client';

import { useState, useEffect } from 'react';
import Chat from '@/components/Chat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles, Bot, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited) {
      setShowWelcome(false);
    } else {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
    setMounted(true);
  }, []);

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  if (!mounted) {
    return <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }

  return (
    <div className="flex-1 flex flex-col items-center min-h-[calc(100vh-64px)]">
      {showWelcome ? (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Welcome to ChatBuddy
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Your AI assistant that connects to multiple language models in one interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-blue-500 dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  Multi-Model Support
                </CardTitle>
                <CardDescription>
                  Seamlessly chat with various models from different providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                Chat with OpenAI, Google Gemini, Anthropic Claude, and Mistral models all in one place.
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-indigo-500 dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Smart Suggestions
                </CardTitle>
                <CardDescription>
                  Intelligent prompt suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                Get useful prompt suggestions to help you get the most out of your AI conversations.
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-violet-500 dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-violet-500" />
                  Thinking Process
                </CardTitle>
                <CardDescription>
                  Peek into the AI&apos;s reasoning process
                </CardDescription>
              </CardHeader>
              <CardContent>
                See step-by-step how the AI forms its responses in thoughtful mode.
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleStartChat}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chatting Now
            </Button>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
            Use your own API keys • Personalize your experience in <Link href="/settings" className="underline hover:text-blue-500 transition-colors">Settings</Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto h-full">
          <Chat />
        </div>
      )}
    </div>
  );
}

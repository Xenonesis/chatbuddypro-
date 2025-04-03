'use client';

import Chat from "@/components/Chat";
import { validateApiConfiguration } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, MessageSquare, Bot, Brain, Cpu, Server } from "lucide-react";

export default function Home() {
  const [apiConfigured, setApiConfigured] = useState(true);
  
  useEffect(() => {
    const config = validateApiConfiguration();
    setApiConfigured(config.anyConfigured);
  }, []);
  
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-6">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-1.5 sm:mb-2">AI Chatbot</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg px-3 sm:px-0">
            Chat with multiple AI models using your own API keys. Your messages are processed directly with the AI provider's API.
          </p>
        </div>
        
        {!apiConfigured && (
          <div className="w-full mb-6 sm:mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3 sm:p-4 md:p-6 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <Server className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1.5 sm:mb-2">Connect Your AI Service</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 max-w-md">
                  To start chatting, you need to add at least one API key for OpenAI, Google Gemini, or Mistral AI.
                  Your API keys are stored locally in your browser and never sent to any server.
                </p>
                <Link href="/settings">
                  <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9">
                    <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Configure API Keys
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-0.5 sm:mb-1 text-sm sm:text-base">Multiple AI Models</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Choose between OpenAI, Google Gemini, and Mistral AI models
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-0.5 sm:mb-1 text-sm sm:text-base">5 Chat Modes</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Thoughtful, Quick, Creative, Technical, and Learning modes
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center sm:col-span-2 md:col-span-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 dark:text-orange-400" />
              </div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-0.5 sm:mb-1 text-sm sm:text-base">Fully Client-Side</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Your data and API keys never leave your browser
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Chat />
    </div>
  );
}

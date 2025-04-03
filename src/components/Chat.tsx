"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendIcon, Settings, Loader2, X, Menu, Brain, Zap, Lightbulb, Code, GraduationCap, Eye, EyeOff, ChevronDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { callAI, ChatMessage } from '@/lib/api';
import { useModelSettings, AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { useClientOnly } from '@/lib/utils';
import ApiDiagnostics from "./ApiDiagnostics";

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thinking?: string;
};

export default function Chat() {
  const { settings, currentProvider, setCurrentProvider, setChatMode, toggleShowThinking, updateSettings } = useModelSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [thinking, setThinking] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const providerMenuRef = useRef<HTMLDivElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const isClient = useClientOnly();

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (providerMenuRef.current && !providerMenuRef.current.contains(event.target as Node)) {
        setShowProviderMenu(false);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get available providers
  const availableProviders = Object.entries(settings)
    .filter(([key, value]) => 
      key !== 'defaultProvider' && 
      key !== 'chatMode' && 
      key !== 'showThinking' && 
      typeof value === 'object' && 
      'enabled' in value && 
      value.enabled
    )
    .map(([key]) => key as AIProvider);

  // Effect to set initial provider
  useEffect(() => {
    // If current provider is disabled, switch to the default or first available
    if (!settings[currentProvider]?.enabled) {
      const newProvider = settings.defaultProvider && settings[settings.defaultProvider].enabled 
        ? settings.defaultProvider 
        : availableProviders[0];
      
      if (newProvider) {
        setCurrentProvider(newProvider);
      }
    }
  }, [settings, currentProvider, setCurrentProvider, availableProviders]);

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Simulate "thinking" for selected chat modes
  const simulateThinking = async () => {
    if (settings.chatMode === 'thoughtful' && settings.showThinking) {
      const thoughts = [
        "Analyzing the query...",
        "Considering multiple perspectives...",
        "Evaluating relevant information...",
        "Organizing a structured response...",
        "Refining the answer for clarity..."
      ];
      
      for (const thought of thoughts) {
        setThinking(prev => prev ? `${prev}\n${thought}` : thought);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setThinking('');
    
    // Track the original provider to detect if we need to fallback
    const originalProvider = currentProvider;
    
    try {
      // Simulate thinking process
      simulateThinking();
      
      // Convert messages to the format expected by API
      const apiMessages: ChatMessage[] = messages
        .concat(userMessage)
        .map(({ role, content }) => ({ role, content }));
      
      // Debug check for Gemini API key when using Gemini
      if (currentProvider === 'gemini') {
        const apiKey = settings?.gemini?.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        
        // Log Gemini settings for debugging
        console.log('Gemini provider settings:', {
          apiKeyConfigured: Boolean(apiKey),
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 6)}...` : 'none',
          model: settings?.gemini?.selectedModel,
          temperature: settings?.gemini?.temperature,
          maxTokens: settings?.gemini?.maxTokens,
        });
        
        if (!apiKey) {
          throw new Error('Gemini API key is not configured. Please set it in Settings or .env.local');
        }
        
        if (!apiKey.startsWith('AIza')) {
          throw new Error('Invalid Gemini API key format. Keys should start with "AIza".');
        }
      }
      
      // Make API call using the unified callAI function
      const response = await callAI(apiMessages, currentProvider, settings);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        thinking: thinking || undefined
      };
      
      setThinking('');
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create better error message depending on provider
      let errorContent = '';
      if (currentProvider === 'gemini' && error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('invalid')) {
          errorContent = `Error: Your Gemini API key is invalid. Please go to Settings and add a valid Gemini API key, or create a .env.local file with the correct NEXT_PUBLIC_GEMINI_API_KEY.
          
Get your API key at: https://aistudio.google.com/app/apikey`;
        } else if (error.message.includes('API key')) {
          errorContent = `Error: ${error.message}\n\nPlease go to Settings and add your Gemini API key, or create a .env.local file with NEXT_PUBLIC_GEMINI_API_KEY.`;
        } else if (error.message.includes('rate limit')) {
          errorContent = `Error: You've hit Gemini's rate limit. Please wait a moment before trying again, or switch to a different AI provider.`;
        } else if (error.message.includes('Empty response') || error.message.includes('{}')) {
          errorContent = `Error: Received empty response from Gemini API. This may be due to a network issue, invalid API key, or content policy violation.`;
        } else if (error.message.includes('not found for API version') || error.message.includes('not supported for generateContent')) {
          errorContent = `Error: The Gemini API is having trouble with your request due to API version changes. The app is trying to work around this automatically.
          
Please try:
1. Send your message again (the app will try a different API version)
2. If that fails, try restarting your browser
3. Or switch to a different AI provider temporarily`;
        } else if (error.message.includes('Model not found') || error.message.includes('not available')) {
          errorContent = `Error: The selected Gemini model (${settings.gemini.selectedModel}) is not available. 
          
This may be because:
1. The model is still in preview and not yet publicly available
2. Your API key doesn't have access to this model
3. You need to wait for Google to update their API

The app will automatically try to fall back to the standard gemini-pro model. If that doesn't work, please try a different model.`;
        } else {
          errorContent = `Error from Gemini: ${error.message}`;
        }
      } else {
        errorContent = error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Sorry, an error occurred while processing your request.';
      }
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: errorContent,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      // Add debugging details to console
      console.log('Current provider:', currentProvider);
      console.log('API Key configured:', settings[currentProvider]?.apiKey ? 'Yes' : 'No');
      console.log('API Error details:', error);
      
      // Check if we should try to fallback to a different provider
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        
        // If the last message was also an error from the same provider, try to switch providers
        if (lastMessage.role === 'assistant' && 
            lastMessage.content.startsWith('Error:') && 
            originalProvider === currentProvider &&
            availableProviders.length > 1) {
          
          // Find the next available provider that's not the current one
          const nextProviderIndex = (availableProviders.indexOf(currentProvider) + 1) % availableProviders.length;
          const nextProvider = availableProviders[nextProviderIndex];
          
          // Display message about fallback
          const fallbackNote: Message = {
            id: Date.now().toString() + '-fallback',
            content: `I'm automatically switching to ${getProviderDisplayName(nextProvider)} because ${getProviderDisplayName(currentProvider)} is experiencing issues.`,
            role: 'assistant',
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, errorMessage, fallbackNote]);
          
          // Switch provider
          setCurrentProvider(nextProvider);
          
          // No need to add the regular error message since we added the fallback note too
          setThinking('');
          setIsLoading(false);
          return;
        }
      }
      
      setThinking('');
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Function to get model name from current provider
  const getCurrentModelName = () => {
    if (!currentProvider || !settings[currentProvider]) return 'AI Model';
    return settings[currentProvider].selectedModel;
  };

  // Function to get model pricing info for Gemini models
  const getModelPricingInfo = (model: string) => {
    if (!model.startsWith('gemini')) return null;
    
    switch(model) {
      case 'gemini-1.5-pro': 
        return 'Pricing: $1.25/1M input tokens, $5/1M output tokens';
      case 'gemini-1.5-flash': 
        return 'Pricing: 7.5¢/1M input tokens, 30¢/1M output tokens';
      case 'gemini-2.0-flash': 
        return 'Pricing: 10¢/1M input tokens, 40¢/1M output tokens';
      case 'gemini-2.0-flash-lite': 
        return 'Pricing: 7.5¢/1M input tokens, 30¢/1M output tokens';
      default:
        return null;
    }
  };

  // Function to get provider display name
  const getProviderDisplayName = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Gemini';
      case 'mistral': return 'Mistral';
      default: return (provider as string).charAt(0).toUpperCase() + (provider as string).slice(1);
    }
  };

  // Function to get provider icon color
  const getProviderColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return '#10B981'; // text-green-500
      case 'gemini': return '#3B82F6'; // text-blue-500
      case 'mistral': return '#8B5CF6'; // text-purple-500
      default: return '#6B7280'; // text-gray-500
    }
  };

  // Function to get provider background color
  const getProviderBgColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'bg-green-100';
      case 'gemini': return 'bg-blue-100';
      case 'mistral': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  // Function to get provider text color
  const getProviderTextColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'text-green-500';
      case 'gemini': return 'text-blue-500';
      case 'mistral': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  // Get chat mode icon and color
  const getModeIcon = (mode?: ChatMode) => {
    switch(mode) {
      case 'thoughtful': return <Brain className="h-4 w-4" />;
      case 'quick': return <Zap className="h-4 w-4" />;
      case 'creative': return <Lightbulb className="h-4 w-4" />;
      case 'technical': return <Code className="h-4 w-4" />;
      case 'learning': return <GraduationCap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />; // Default to thoughtful icon
    }
  };

  const getModeColor = (mode: ChatMode) => {
    switch(mode) {
      case 'thoughtful': return 'bg-blue-600';
      case 'quick': return 'bg-yellow-500';
      case 'creative': return 'bg-orange-500';
      case 'technical': return 'bg-slate-700';
      case 'learning': return 'bg-emerald-600';
      default: return 'bg-blue-600';
    }
  };

  const getModeDisplayName = (mode?: ChatMode) => {
    if (!mode) return 'Thoughtful'; // Default to Thoughtful if mode is undefined
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  // Function to handle model change
  const handleModelChange = (model: string) => {
    const updatedSettings = {...settings};
    updatedSettings[currentProvider].selectedModel = model;
    updateSettings(updatedSettings);
    setShowModelMenu(false);
  };

  // Toggle model menu
  const toggleModelMenu = () => {
    setShowModelMenu(!showModelMenu);
    if (showProviderMenu) setShowProviderMenu(false);
    if (showModeMenu) setShowModeMenu(false);
  };

  // Toggle provider menu for mobile
  const toggleProviderMenu = () => {
    setShowProviderMenu(!showProviderMenu);
    if (showModeMenu) setShowModeMenu(false);
  };

  // Toggle mode menu
  const toggleModeMenu = () => {
    setShowModeMenu(!showModeMenu);
    if (showProviderMenu) setShowProviderMenu(false);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-800 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Provider Selector */}
          <div className="relative" ref={providerMenuRef}>
            <Button 
              variant="outline" 
              className={`flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm ${showProviderMenu ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400' : 'dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              onClick={toggleProviderMenu}
              style={{color: getProviderColor(currentProvider)}}
            >
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: getProviderColor(currentProvider)}}></div>
              <span className="font-medium">{getProviderDisplayName(currentProvider)}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
            
            {showProviderMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                {availableProviders.map((provider) => (
                  <button
                    key={provider}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => {
                      setCurrentProvider(provider);
                      setShowProviderMenu(false);
                    }}
                    style={{color: getProviderColor(provider)}}
                  >
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: getProviderColor(provider)}}></div>
                    <span className="font-medium">{getProviderDisplayName(provider)}</span>
                    {currentProvider === provider && (
                      <div className="ml-auto">✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Model Selector */}
          <div className="relative" ref={modelMenuRef}>
            <Button 
              variant="outline" 
              className={`flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px] md:max-w-none ${showModelMenu ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400' : 'dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'}`}
              onClick={toggleModelMenu}
            >
              <span className="font-medium truncate">{getCurrentModelName()}</span>
              <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-50" />
            </Button>
            
            {showModelMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                {settings[currentProvider].models.map((model) => (
                  <button
                    key={model}
                    className="flex flex-col items-start gap-1 w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                    onClick={() => handleModelChange(model)}
                  >
                    <span className="font-medium">{model}</span>
                    {getModelPricingInfo(model) && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {getModelPricingInfo(model)}
                      </span>
                    )}
                    {settings[currentProvider].selectedModel === model && (
                      <div className="ml-auto">✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Mode Selector */}
          <div className="relative" ref={modeMenuRef}>
            <Button 
              variant="outline" 
              className={`flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm ${showModeMenu ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400' : 'dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              onClick={toggleModeMenu}
              style={{color: getModeColor(settings.chatMode)}}
            >
              {getModeIcon(settings.chatMode)}
              <span className="font-medium hidden xs:inline">{getModeDisplayName(settings.chatMode)}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
            
            {showModeMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                {['thoughtful', 'quick', 'creative', 'technical', 'learning'].map((mode) => (
                  <button
                    key={mode}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => {
                      setChatMode(mode as ChatMode);
                      setShowModeMenu(false);
                    }}
                    style={{color: getModeColor(mode as ChatMode)}}
                  >
                    {getModeIcon(mode as ChatMode)}
                    <span className="font-medium">{getModeDisplayName(mode as ChatMode)}</span>
                    {settings.chatMode === mode && (
                      <div className="ml-auto">✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Thinking Toggle */}
          <Button
            variant="outline"
            size="sm" 
            className={`h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200`}
            onClick={toggleShowThinking}
          >
            {settings.showThinking ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden xs:inline">
              {settings.showThinking ? 'Hide' : 'Show'} thinking
            </span>
          </Button>
          
          <ApiDiagnostics provider={currentProvider} />
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 bg-gray-50/50 dark:bg-slate-900 chat-scroll">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-2 sm:px-4 py-6 sm:py-10">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3 sm:mb-4">
              <MessageSquare className="h-7 sm:h-8 w-7 sm:w-8 text-blue-400 dark:text-blue-300" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1 sm:mb-2">Start a conversation</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md">
              Select your AI provider and model, then ask a question to begin chatting.
              Your messages are processed directly with the AI provider's API.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[90%] sm:max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full ${message.role === 'user' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`}>
                    <AvatarImage src="" />
                    <AvatarFallback className={message.role === 'user' ? 'bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300' : `${getProviderBgColor(currentProvider)} ${getProviderTextColor(currentProvider)} dark:bg-slate-800 dark:text-slate-300`}>
                      {message.role === 'user' ? 'U' : 
                       currentProvider === 'openai' ? 'O' : 
                       currentProvider === 'gemini' ? 'G' : 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className={`px-2.5 py-2 sm:p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white dark:bg-blue-600' 
                        : 'bg-white border border-gray-200 text-slate-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                    }`}>
                      <div className="whitespace-pre-wrap text-xs sm:text-sm responsive-text">
                        {message.content}
                      </div>
                    </div>
                    {message.thinking && settings.showThinking && (
                      <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-50 border border-amber-100 rounded-lg dark:bg-amber-900/20 dark:border-amber-700/30">
                        <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 font-mono whitespace-pre-wrap">
                          <span className="text-amber-500 dark:text-amber-400 font-semibold">Thinking:</span> {message.thinking}
                        </p>
                      </div>
                    )}
                    <div className={`text-[10px] text-slate-400 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Thinking indicator */}
            {isLoading && thinking && settings.showThinking && (
              <div className="flex justify-start">
                <div className="flex max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 rounded-full mr-2 sm:mr-3">
                    <AvatarFallback className="bg-amber-100 text-amber-500 dark:bg-amber-900/50 dark:text-amber-300">T</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-amber-50 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30">
                      <div className="whitespace-pre-wrap text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 font-mono">
                        <span className="text-amber-500 dark:text-amber-400 font-semibold">Thinking:</span> {thinking}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {isLoading && !thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 p-2 sm:p-3 max-w-[75%]">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-300 dark:bg-blue-500 animate-pulse"></div>
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-300 dark:bg-blue-500 animate-pulse delay-100"></div>
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-300 dark:bg-blue-500 animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="pb-safe" />
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-2 sm:p-3 border-t dark:border-slate-700 chat-input">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea 
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-[50px] sm:min-h-[60px] max-h-24 sm:max-h-32 pr-11 sm:pr-12 resize-none rounded-lg border border-slate-300 p-2 sm:p-3 text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400"
            />
            <Button
              size="icon"
              disabled={isLoading || !input.trim()}
              onClick={handleSend}
              className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 h-7 w-7 sm:h-8 sm:w-8 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? <Loader2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 animate-spin" /> : <SendIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
            </Button>
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-400 flex justify-between items-center">
          <div>
            Press <kbd className="px-1 sm:px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">Enter</kbd> to send, <kbd className="px-1 sm:px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">Shift+Enter</kbd> for new line
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  SendIcon, 
  Loader2, 
  Brain, 
  Zap, 
  Lightbulb, 
  Code, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  RefreshCw,
  Sparkles,
  Settings,
  TerminalSquare,
  Bot,
  User,
  Cpu,
  Cloud,
  Flame,
  FlaskConical,
  Star,
  Wand2,
  MoreHorizontal,
  Moon,
  Sun,
  PlusCircle,
  Activity,
  RotateCw,
  Mic,
  MicOff,
  VolumeX,
  Square,
  AlertCircle,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { callAI, ChatMessage } from '@/lib/api';
import { useModelSettings, AIProvider, ChatMode } from '@/lib/context/ModelSettingsContext';
import { containsCodeBlock, isCodingQuestion, saveChatHistory, ChatHistoryItem, getProviderBackgroundColor, getProviderDisplayName } from '@/lib/utils';
import ApiDiagnostics from "@/components/ApiDiagnostics";
import { FormattedMessage } from '@/components/ui-custom/FormattedMessage';
import { SmartSuggestions } from '@/components/ui-custom/SmartSuggestions';
import { EnhancedErrorFeedback } from '@/components/ui-custom/EnhancedErrorFeedback';
import { FeatureFeedback } from '@/components/ui-custom/FeatureFeedback';
import { ApiStatusIndicator } from '@/components/ui-custom/ApiStatusIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/ui-custom/CodeBlock';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/lib/services/chatService';
import dynamic from 'next/dynamic';

// Import the Message type from our types
import { Message } from '@/types/chat';

// Regular import for MessageRenderer instead of dynamic import for now to fix the error
import MessageRenderer from '@/components/ui-custom/MessageRenderer';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thinking?: string;
  responseTime?: number;
  error?: Error;
};

type ChatProps = {
  initialMessages?: Message[];
  initialTitle?: string;
  initialModel?: string;
  chatId?: string | null;
};

// Define default models for each provider
const DEFAULT_MODELS = {
  openai: 'gpt-3.5-turbo',
  gemini: 'gemini-2.0-flash',
  mistral: 'mistral-small',
  claude: 'claude-3-5-sonnet-20240620',
  llama: 'llama-3-8b-instruct',
  deepseek: 'deepseek-chat'
};

export default function Chat({ initialMessages = [], initialTitle = '', initialModel = '', chatId: initialChatId = null }: ChatProps) {
  const { settings, currentProvider, setCurrentProvider, setChatMode, toggleShowThinking, updateSettings, apiKeys } = useModelSettings();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [thinking, setThinking] = useState<string>('');
  const [lastUsedProvider, setLastUsedProvider] = useState<AIProvider | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const providerMenuRef = useRef<HTMLDivElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [messageHasBeenSent, setMessageHasBeenSent] = useState(false);
  const [typingAnimationComplete, setTypingAnimationComplete] = useState(true);
  const [scrollLocked, setScrollLocked] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [title, setTitle] = useState<string>(initialTitle);
  const [selectedModel, setSelectedModel] = useState<string>(initialModel);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [activeModel, setActiveModel] = useState<string>(initialModel || DEFAULT_MODELS.openai);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [lastError, setLastError] = useState<Error | null>(null);
  
  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);
  
  // Set initial model if provided
  useEffect(() => {
    if (initialModel && initialModel !== '') {
      // Find the provider for this model
      Object.entries(DEFAULT_MODELS).forEach(([provider, modelName]) => {
        if (modelName === initialModel) {
          setCurrentProvider(provider as AIProvider);
        }
      });
    } else if (!initialModel && settings.defaultProvider) {
      // No initial model specified, use the default provider if it's enabled and has an API key
      const defaultProvider = settings.defaultProvider;
      if (settings[defaultProvider]?.enabled && settings[defaultProvider]?.apiKey) {
        console.log(`Using default provider from settings: ${defaultProvider}`);
        setCurrentProvider(defaultProvider);
      }
    }
  }, [initialModel, settings, setCurrentProvider]);
  
  // Set initial provider if it doesn't have an API key
  useEffect(() => {
    // Calculate available providers inside the effect
    const availableProvidersList = Object.entries(settings)
      .filter(([key, value]) => 
        key !== 'defaultProvider' && 
        key !== 'chatMode' && 
        key !== 'showThinking' && 
        typeof value === 'object' && 
        'enabled' in value && 
        value.enabled && 
        'apiKey' in value && 
        value.apiKey // Only include providers with API keys configured
      )
      .map(([key]) => key as AIProvider);
    
    // Check if current provider has an API key
    if (!settings[currentProvider]?.apiKey && availableProvidersList.length > 0) {
      // First try to use the default provider if it's in the available list
      const defaultProvider = settings.defaultProvider;
      if (defaultProvider && availableProvidersList.includes(defaultProvider)) {
        console.log(`Using default provider from settings: ${defaultProvider}`);
        setCurrentProvider(defaultProvider);
      } else {
        // Fall back to the first available provider with an API key
        console.log(`Default provider not available, using ${availableProvidersList[0]}`);
        setCurrentProvider(availableProvidersList[0]);
      }
    }
  }, [settings, currentProvider, setCurrentProvider]);

  const { voiceInputSettings } = settings;
  
  const { 
    isListening, 
    toggleListening, 
    transcript, 
    resetTranscript,
    noSpeechDetected,
    browserSupportsSpeechRecognition,
    microphoneAvailable,
    micPermissionDenied,
    requestMicrophonePermission
  } = useVoiceInput({
    onTranscriptChange: (text) => {
      if (text && text.trim()) {
        setInput(prev => {
          // Avoid duplicating text if it's already in the input
          if (prev.includes(text)) return prev;
          return prev ? `${prev} ${text}`.trim() : text.trim();
        });
      }
    }
  });
  
  useEffect(() => {
    if (voiceInputSettings.enabled && !microphoneAvailable && !micPermissionDenied) {
      requestMicrophonePermission();
    }
  }, [voiceInputSettings.enabled, microphoneAvailable, micPermissionDenied, requestMicrophonePermission]);

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
      value.enabled && 
      'apiKey' in value && 
      value.apiKey // Only include providers with API keys configured
    )
    .map(([key]) => key as AIProvider);

  // Check if the current provider has an API key configured
  const hasApiKey = (provider: AIProvider): boolean => {
    // Check settings and environment variables only
    const settingsHasKey = !!settings[provider]?.apiKey;
    const envHasKey = !!process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_API_KEY`];

    return settingsHasKey || envHasKey;
  };

  // Effect to set initial provider
  useEffect(() => {
    // If current provider is disabled or doesn't have an API key, switch to another provider
    if (!settings[currentProvider]?.enabled || !settings[currentProvider]?.apiKey) {
      // First try to use the default provider if it's enabled and has an API key
      const defaultProvider = settings.defaultProvider;
      if (defaultProvider && 
          settings[defaultProvider]?.enabled && 
          settings[defaultProvider]?.apiKey) {
        console.log(`Current provider unavailable, using default provider: ${defaultProvider}`);
        setCurrentProvider(defaultProvider);
      }
      // Otherwise use the first available provider
      else if (availableProviders.length > 0) {
        console.log(`Default provider unavailable, using first available: ${availableProviders[0]}`);
        setCurrentProvider(availableProviders[0]);
      }
    }
  }, [settings, currentProvider, setCurrentProvider, availableProviders]);

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // New effect to measure and set input height as CSS variable
  useEffect(() => {
    // Function to measure input height and set CSS variable
    const setInputHeight = () => {
      if (inputAreaRef.current) {
        const height = inputAreaRef.current.offsetHeight;
        document.documentElement.style.setProperty('--input-height', `${height}px`);
      }
    };

    // Set initial height
    setInputHeight();

    // Update height on resize
    window.addEventListener('resize', setInputHeight);

    // Also update when input content changes
    const resizeObserver = new ResizeObserver(setInputHeight);
    if (inputAreaRef.current) {
      resizeObserver.observe(inputAreaRef.current);
    }

    return () => {
      window.removeEventListener('resize', setInputHeight);
      resizeObserver.disconnect();
    };
  }, []);

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

  // Enhanced send message function with typing animation effect
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsTyping(false);
    
    // Add user message immediately
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setMessageHasBeenSent(true);
    
    // Scroll to bottom for user message
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    // Start loading indicator
    setIsLoading(true);
    setTypingAnimationComplete(false);
    
    // Wait a moment for realistic effect
    await new Promise(r => setTimeout(r, 300));
    
    try {
      // Check if the current provider has an API key
      if (!hasApiKey(currentProvider)) {
        // Add an error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `Error: No API key configured for ${getProviderDisplayName(currentProvider)}. Please go to Settings and add your API key.`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      // Create a new chat in the database if this is the first message and user is logged in
      if (messages.length === 0 && user) {
        try {
          // Get the current model name
          const modelName = DEFAULT_MODELS[currentProvider];
          
          // Create a chat with the first message as the title and save the model name
          const chat = await chatService.createChat(
            user.id, 
            userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
            modelName,
            user.email || undefined,
            user.user_metadata?.full_name || undefined
          );
          
          if (chat) {
            console.log('Created new chat:', chat);
            setChatId(chat.id);
            
            // Save the first message to the chat
            await chatService.addMessage(
              chat.id,
              user.id,
              'user',
              userMessage
            );
          }
        } catch (error) {
          console.error('Error creating chat:', error);
          // Continue with the chat even if saving to DB fails
        }
      } else if (chatId && user) {
        // Save the message to an existing chat
        try {
          await chatService.addMessage(
            chatId,
            user.id,
            'user',
            userMessage
          );
        } catch (error) {
          console.error('Error saving message:', error);
          // Continue with the chat even if saving to DB fails
        }
      }
      
      // Detect if this is a coding question
      const isCodeQuestion = isCodingQuestion(userMessage);
      
      // Track the original provider to detect if we need to fallback
      setLastUsedProvider(currentProvider);
      const startTime = performance.now();
      
      // Simulate thinking process
      simulateThinking();
      
      // Convert messages to the format expected by API
      let apiMessages: ChatMessage[] = messages
        .concat(newUserMessage)
        .map(({ role, content }) => ({ role, content }));
      
      // If this is a coding question, add a hint to the system to format the response with code blocks
      if (isCodeQuestion) {
        // Add a system message to guide the AI to format the response with code blocks
        apiMessages = [
          { 
            role: 'system', 
            content: `The user is asking a coding question. Please provide a COMPLETE and COMPREHENSIVE code solution, following these guidelines:

1. Use markdown code blocks with proper language tags: \`\`\`language\ncode\`\`\`
2. Always specify the correct language (e.g. \`\`\`javascript, \`\`\`python, \`\`\`css) for syntax highlighting
3. For JavaScript code, use \`\`\`javascript specifically (not just \`\`\`js)
4. For CSS code, put it in \`\`\`css code blocks
5. Provide FULL, WORKING implementations - do not abbreviate or truncate code with comments like "// more code here"
6. Include ALL necessary imports, dependencies, and supporting code needed to make the solution work
7. When showing multiple files or components, clearly label each one and provide complete code for each
8. Use separate code blocks for different languages or files
9. Format code with proper indentation and maintain consistent style
10. Include helpful comments to explain complex sections
11. When appropriate, provide a brief explanation of how the code works

Remember: It's better to provide a COMPLETE solution that fully addresses the user's need than a partial or simplified one.` 
          },
          ...apiMessages
        ];
      }
      
      // Adjust API settings for coding questions to allow for longer responses
      const apiSettings = {...settings};

      // Debug: Log the current settings being passed to API
      console.log(`Chat: About to call ${currentProvider} API with settings:`, {
        provider: currentProvider,
        hasApiKey: !!(apiSettings[currentProvider]?.apiKey),
        apiKeyLength: apiSettings[currentProvider]?.apiKey?.length || 0,
        apiKeyPrefix: apiSettings[currentProvider]?.apiKey ?
          apiSettings[currentProvider].apiKey.substring(0, 8) + '...' : 'none',
        temperature: apiSettings[currentProvider]?.temperature,
        maxTokens: apiSettings[currentProvider]?.maxTokens
      });

      if (isCodeQuestion) {
        // For coding questions, increase the max tokens to allow for complete code examples
        if (apiSettings[currentProvider]?.maxTokens) {
          const currentMaxTokens = apiSettings[currentProvider].maxTokens;
          apiSettings[currentProvider].maxTokens = Math.max(currentMaxTokens, 8000);
        }

        // Also reduce temperature slightly for more precise code generation
        if (apiSettings[currentProvider]?.temperature) {
          const currentTemp = apiSettings[currentProvider].temperature;
          apiSettings[currentProvider].temperature = Math.min(currentTemp, 0.7);
        }
      }
      
      // Debug check for Gemini API key when using Gemini
      if (currentProvider === 'gemini') {
        const apiKey = settings?.gemini?.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        // Log Gemini settings for debugging
        console.log('Gemini provider settings:', {
          apiKeyConfigured: Boolean(apiKey),
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 6)}...` : 'none',
          model: DEFAULT_MODELS.gemini,
          temperature: settings?.gemini?.temperature,
          maxTokens: settings?.gemini?.maxTokens,
        });

        // Note: We don't throw errors here anymore since callAI handles validation
        // and provides demo mode fallback when API keys are missing or invalid
      }
      
      // Make API call using the unified callAI function with adjusted settings
      const response = await callAI(apiMessages, currentProvider, apiSettings);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime) / 1000;

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        thinking: thinking || undefined,
        responseTime
      };

      setThinking('');
      setMessages((prev) => [...prev, assistantMessage]);
      setMessageHasBeenSent(true);
      setTimeout(() => setTypingAnimationComplete(true), 500);
      
      // Save the assistant's response to the database if user is logged in
      if (chatId && user) {
        try {
          await chatService.addMessage(
            chatId,
            user.id,
            'assistant',
            response
          );
          
          // Update the chat with the current model if it changed
          const modelName = DEFAULT_MODELS[currentProvider];
          await chatService.updateChat(chatId, user.id, { model: modelName });
        } catch (error) {
          console.error('Error saving assistant response:', error);
          // Continue with the chat even if saving to DB fails
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create better error message depending on provider
      let errorContent = '';
      if (currentProvider === 'gemini' && error instanceof Error) {
        if (error.message.includes('API key not valid') || error.message.includes('invalid') || error.message.includes('Invalid Gemini API key detected')) {
          errorContent = `Error: Your Gemini API key is invalid or not properly configured.

To fix this:
1. Go to Settings and remove any existing invalid API key
2. Get a new API key from: https://aistudio.google.com/app/apikey
3. Add the new key in Settings or in your .env.local file as NEXT_PUBLIC_GEMINI_API_KEY

Note: If you see this error repeatedly, try clearing your browser's localStorage and re-entering your API key.`;
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
          errorContent = `Error: The Gemini model (${DEFAULT_MODELS['gemini']}) is not available. 
          
This may be because:
1. The model is still in preview and not yet publicly available
2. Your API key doesn't have access to this model
3. You need to wait for Google to update their API

The app will automatically try to fall back to the standard gemini-2.0-flash model. If that doesn't work, please try a different model.`;
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
        if (lastMessage && lastMessage.role === 'assistant' &&
            lastMessage.content && lastMessage.content.startsWith('Error:') &&
            lastUsedProvider === currentProvider) {
          
          // Try to fallback to another provider
          if (fallbackToAnotherProvider(currentProvider, errorMessage)) {
            // Fallback handled, cleanup
            setThinking('');
            setIsLoading(false);
            return;
          }
        } else {
          // Just show the error message
          setThinking('');
          setMessages((prev) => [...prev, errorMessage]);
        }
      } else {
        // No previous messages, just show the error
        setThinking('');
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom of chat
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior,
        });
      }
    });
  };
  
  // Watch for new messages to scroll
  useEffect(() => {
    if (messageHasBeenSent) {
      scrollToBottom();
      setMessageHasBeenSent(false);
    }
  }, [messages, messageHasBeenSent]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // On mobile, always scroll to bottom when new message arrives
        setScrollLocked(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add scroll event listener to track scrolling
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    
    const handleScroll = () => {
      if (!chatContainer) return;
      
      const scrollTop = chatContainer.scrollTop;
      const scrollHeight = chatContainer.scrollHeight;
      const clientHeight = chatContainer.clientHeight;
      
      // Determine scroll direction
      const isScrollingDown = scrollTop > lastScrollTop;
      setLastScrollTop(scrollTop);
      
      // Calculate distance from bottom
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 100;
      
      // Show input when:
      // 1. User is scrolling up
      // 2. User is near the bottom of the chat
      // 3. Chat is short enough that the user can see most of it
      const isShortContent = scrollHeight < clientHeight * 1.5;
      
      if (!isScrollingDown || isNearBottom || isShortContent) {
        setIsInputVisible(true);
      } else if (isScrollingDown && Math.abs(scrollTop - lastScrollTop) > 10) {
        // Only hide when actually scrolling down meaningfully (not just tiny movements)
        setIsInputVisible(false);
      }
      
      // Set scrolling state to track active scrolling
      setIsScrolling(true);
      
      // Clear previous timeout and set a new one
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Show input area after scrolling stops for a short period
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        
        // When scrolling stops, always show input if at the bottom
        if (isNearBottom || isShortContent) {
          setIsInputVisible(true);
        }
      }, 800);
    };
    
    chatContainer?.addEventListener('scroll', handleScroll);
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      chatContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollTop]);

  // Show input area when user interacts with the page
  useEffect(() => {
    const handleInteraction = () => {
      setIsInputVisible(true);
    };
    
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);



  // Add regenerate function to re-send the last user message
  const handleRegenerate = async () => {
    if (isLoading || messages.length < 2) return;
    
    // Find the last user message index (scanning from the end)
    const messagesReversed = [...messages].reverse();
    const lastUserMessageIndex = messagesReversed.findIndex(m => m && m.role === 'user');
    
    if (lastUserMessageIndex === -1) return;
    
    // Get the actual index in the original array
    const actualLastUserIndex = messages.length - 1 - lastUserMessageIndex;
    
    // Get the last user message content
    const lastUserMessage = messages[actualLastUserIndex];
    
    // Check if it's a coding question
    const isCodeQuestion = isCodingQuestion(lastUserMessage.content);
    
    // Keep messages up to and including the last user message
    const messagesToKeep = messages.slice(0, actualLastUserIndex + 1);
    setMessages(messagesToKeep);
    
    // Process the regeneration
    setIsLoading(true);
    setThinking('');
    
    const startTime = performance.now();
    
    try {
      // Simulate thinking process
      simulateThinking();
      
      // Convert messages to the format expected by API
      let apiMessages: ChatMessage[] = messagesToKeep
        .map(({ role, content }) => ({ role, content }));
      
      // If this is a coding question, add a hint to the system to format the response with code blocks
      if (isCodeQuestion) {
        // Add a system message to guide the AI to format the response with code blocks
        apiMessages = [
          { 
            role: 'system', 
            content: `The user is asking a coding question. Please provide a COMPLETE and COMPREHENSIVE code solution, following these guidelines:

1. Use markdown code blocks with proper language tags: \`\`\`language\ncode\`\`\`
2. Always specify the correct language (e.g. \`\`\`javascript, \`\`\`python, \`\`\`css) for syntax highlighting
3. For JavaScript code, use \`\`\`javascript specifically (not just \`\`\`js)
4. For CSS code, put it in \`\`\`css code blocks
5. Provide FULL, WORKING implementations - do not abbreviate or truncate code with comments like "// more code here"
6. Include ALL necessary imports, dependencies, and supporting code needed to make the solution work
7. When showing multiple files or components, clearly label each one and provide complete code for each
8. Use separate code blocks for different languages or files
9. Format code with proper indentation and maintain consistent style
10. Include helpful comments to explain complex sections
11. When appropriate, provide a brief explanation of how the code works

Remember: It's better to provide a COMPLETE solution that fully addresses the user's need than a partial or simplified one.` 
          },
          ...apiMessages
        ];
      }
      
      // Adjust API settings for coding questions to allow for longer responses
      const regenerateApiSettings = {...settings};
      if (isCodeQuestion) {
        // For coding questions, increase the max tokens to allow for complete code examples
        if (regenerateApiSettings[currentProvider]?.maxTokens) {
          const currentMaxTokens = regenerateApiSettings[currentProvider].maxTokens;
          regenerateApiSettings[currentProvider].maxTokens = Math.max(currentMaxTokens, 4000);
        }
        
        // Also reduce temperature slightly for more precise code generation
        if (regenerateApiSettings[currentProvider]?.temperature) {
          const currentTemp = regenerateApiSettings[currentProvider].temperature;
          regenerateApiSettings[currentProvider].temperature = Math.min(currentTemp, 0.7);
        }
      }
      
      // Make API call using the unified callAI function with adjusted settings
      const response = await callAI(apiMessages, currentProvider, regenerateApiSettings);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime) / 1000;
      
      // Add regenerated assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        thinking: thinking || undefined,
        responseTime
      };
      
      setThinking('');
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setLastError(error instanceof Error ? error : new Error('Unknown error occurred'));
      
      // Create enhanced error message with feedback component
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '', // Will be handled by the enhanced error component
        role: 'assistant',
        timestamp: new Date(),
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSend();
      }
    }
  };

  // Function to get model name from current provider
  const getCurrentModelName = () => {
    if (!currentProvider) return 'AI Model';
    return settings[currentProvider]?.selectedModel || DEFAULT_MODELS[currentProvider];
  };

  // Function to get model pricing info for models
  const getModelPricingInfo = (model: string) => {
    // Gemini models
    if (model.startsWith('gemini')) {
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
    }
    
    // Claude models
    if (model.startsWith('claude')) {
      switch(model) {
        case 'claude-3-5-sonnet-20240620': 
          return 'Pricing: $3/1M input tokens, $15/1M output tokens';
        case 'claude-3-opus-20240229': 
          return 'Pricing: $15/1M input tokens, $75/1M output tokens';
        case 'claude-3-sonnet-20240229': 
          return 'Pricing: $3/1M input tokens, $15/1M output tokens';
        case 'claude-3-haiku-20240307': 
          return 'Pricing: $0.25/1M input tokens, $1.25/1M output tokens';
        default:
          return null;
      }
    }
    
    // Llama models via Together.ai
    if (model.startsWith('llama')) {
      switch(model) {
        case 'llama-3-8b-instruct': 
          return 'Pricing varies by provider';
        case 'llama-3-70b-instruct': 
          return 'Pricing varies by provider';
        default:
          return null;
      }
    }
    
    return null;
  };

  // Function to get provider display name
  const getProviderDisplayName = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'OpenAI';
      case 'gemini': return 'Gemini';
      case 'mistral': return 'Mistral';
      case 'claude': return 'Claude';
      case 'llama': return 'Llama';
      case 'deepseek': return 'Deepseek';
      default: return (provider as string).charAt(0).toUpperCase() + (provider as string).slice(1);
    }
  };

  // Function to get provider icon color
  const getProviderColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return '#10B981'; // text-green-500
      case 'gemini': return '#3B82F6'; // text-blue-500
      case 'mistral': return '#8B5CF6'; // text-purple-500
      case 'claude': return '#F59E0B'; // text-amber-500
      case 'llama': return '#F97316'; // text-orange-500 
      case 'deepseek': return '#14B8A6'; // text-teal-500
      default: return '#6B7280'; // text-gray-500
    }
  };

  // Function to get provider background color
  const getProviderBgColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'bg-green-100';
      case 'gemini': return 'bg-blue-100';
      case 'mistral': return 'bg-purple-100';
      case 'claude': return 'bg-amber-100';
      case 'llama': return 'bg-orange-100';
      case 'deepseek': return 'bg-teal-100';
      default: return 'bg-gray-100';
    }
  };

  // Function to get provider text color
  const getProviderTextColor = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return 'text-green-500';
      case 'gemini': return 'text-blue-500';
      case 'mistral': return 'text-purple-500';
      case 'claude': return 'text-amber-500';
      case 'llama': return 'text-orange-500';
      case 'deepseek': return 'text-teal-500';
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

  // Effect to handle suggestion events from SuggestionDrawer
  useEffect(() => {
    const handleSuggestionEvent = (event: CustomEvent<{ suggestion: string }>) => {
      if (event.detail && event.detail.suggestion) {
        setInput(event.detail.suggestion);
        // Focus the textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        // Always show the input when selecting a suggestion
        setIsInputVisible(true);
      }
    };
    
    // Listen for the custom event
    window.addEventListener('suggestion:selected', handleSuggestionEvent as EventListener);
    
    return () => {
      window.removeEventListener('suggestion:selected', handleSuggestionEvent as EventListener);
    };
  }, []);

  // Save chat history for smart suggestions if enabled
  useEffect(() => {
    if (settings.suggestionsSettings?.saveHistory && messages.length > 0) {
      const historyItems: ChatHistoryItem[] = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp
      }));
      saveChatHistory(historyItems);
    }
  }, [messages, settings.suggestionsSettings?.saveHistory]);

  // Get the last assistant message content for follow-up questions
  const lastAssistantMessage = messages
    .filter(msg => msg && msg.role === 'assistant')
    .pop()?.content || '';

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    
    // Check if user started typing (new characters added)
    const userStartedTyping = newValue.length > input.length;
    
    // Set typing state
    setIsTyping(newValue.length > 0);
    
    // If user is manually typing and the microphone is on, turn it off
    if (userStartedTyping && isListening) {
      toggleListening();
    }
  };

  // Reset typing state when input is cleared or message is sent
  useEffect(() => {
    if (input.length === 0) {
      setIsTyping(false);
    }
  }, [input]);

  // Function to get provider gradient colors
  const getProviderGradient = (provider: AIProvider, isDark: boolean = false) => {
    switch(provider) {
      case 'openai': return isDark ? 'bg-gradient-to-r from-green-900 to-emerald-800' : 'bg-gradient-to-r from-green-400 to-emerald-300';
      case 'gemini': return isDark ? 'bg-gradient-to-r from-blue-900 to-indigo-800' : 'bg-gradient-to-r from-blue-400 to-indigo-300';
      case 'mistral': return isDark ? 'bg-gradient-to-r from-purple-900 to-violet-800' : 'bg-gradient-to-r from-purple-400 to-violet-300';
      case 'claude': return isDark ? 'bg-gradient-to-r from-amber-900 to-yellow-800' : 'bg-gradient-to-r from-amber-400 to-yellow-300';
      case 'llama': return isDark ? 'bg-gradient-to-r from-orange-900 to-amber-800' : 'bg-gradient-to-r from-orange-400 to-amber-300';
      case 'deepseek': return isDark ? 'bg-gradient-to-r from-teal-900 to-cyan-800' : 'bg-gradient-to-r from-teal-400 to-cyan-300';
      default: return isDark ? 'bg-gradient-to-r from-gray-900 to-slate-800' : 'bg-gradient-to-r from-gray-400 to-slate-300';
    }
  };

  // Function to get mode gradient colors
  const getModeGradient = (mode: ChatMode, isDark: boolean = false) => {
    switch(mode) {
      case 'thoughtful': return isDark ? 'bg-gradient-to-r from-blue-900 to-sky-800' : 'bg-gradient-to-r from-blue-400 to-sky-300';
      case 'quick': return isDark ? 'bg-gradient-to-r from-yellow-900 to-amber-800' : 'bg-gradient-to-r from-yellow-400 to-amber-300';
      case 'creative': return isDark ? 'bg-gradient-to-r from-orange-900 to-rose-800' : 'bg-gradient-to-r from-orange-400 to-rose-300';
      case 'technical': return isDark ? 'bg-gradient-to-r from-slate-900 to-zinc-800' : 'bg-gradient-to-r from-slate-400 to-zinc-300';
      case 'learning': return isDark ? 'bg-gradient-to-r from-emerald-900 to-teal-800' : 'bg-gradient-to-r from-emerald-400 to-teal-300';
      default: return isDark ? 'bg-gradient-to-r from-blue-900 to-sky-800' : 'bg-gradient-to-r from-blue-400 to-sky-300';
    }
  };

  // Function to get provider icon
  const getProviderIcon = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return <Bot className="h-4 w-4" />;
      case 'gemini': return <Cpu className="h-4 w-4" />;
      case 'mistral': return <Cloud className="h-4 w-4" />;
      case 'claude': return <FlaskConical className="h-4 w-4" />;
      case 'llama': return <Flame className="h-4 w-4" />;
      case 'deepseek': return <Star className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  // Enhanced animations CSS class definitions
  const animations = {
    typing: 'animate-pulse',
    iconWave: 'animate-wave',
    iconPulse: 'animate-pulse',
    iconSpin: 'animate-spin',
    iconBounce: 'animate-bounce',
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
  };

  // Handle voice input toggle
  const handleVoiceInputToggle = async () => {
    // If microphone permission was denied, request it again
    if (micPermissionDenied) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) return;
    }
    
    // Toggle listening state
    await toggleListening();
    
    // Reset transcript if stopping
    if (isListening) {
      resetTranscript();
    }
  };

  // Get available providers with API keys in the database
  const getProvidersWithApiKeys = () => {
    const providersWithApiKeys = Object.keys(apiKeys || {}) as AIProvider[];
    return validProviders.filter(provider => providersWithApiKeys.includes(provider));
  };

  // For fallback purposes, we need providers with API keys
  const getAvailableFallbackProviders = () => {
    const providersWithApiKeys = getProvidersWithApiKeys();
    return providersWithApiKeys.length > 0 ? providersWithApiKeys : availableProviders;
  };

  // Copy to clipboard function with fallback
  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (fallbackError) {
          console.warn('Copy to clipboard not supported in this browser');
          return false;
        } finally {
          document.body.removeChild(textArea);
        }
      }
      return true;
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      return false;
    }
  };

  // Function to render messages with enhanced feedback
  const renderMessages = () => {
    return messages.filter(message => message && message.role).map((message, index) => (
      <div key={message.id} className="mb-4">
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800'} rounded-lg p-3 shadow-sm`}>
            {message.error ? (
              <EnhancedErrorFeedback
                error={message.error}
                provider={currentProvider}
                onRetry={() => {
                  // Remove error message and retry
                  setMessages(prev => prev.filter(m => m.id !== message.id));
                  handleSend();
                }}
                onSwitchProvider={(newProvider) => {
                  setCurrentProvider(newProvider);
                  setMessages(prev => prev.filter(m => m.id !== message.id));
                }}
                availableProviders={availableProviders}
              />
            ) : (
              <>
                <MessageRenderer
                  message={message}
                  content={message.content}
                  onCopy={copyToClipboard}
                />
                {message.role === 'assistant' && message.responseTime && (
                  <div className="mt-3">
                    <FeatureFeedback
                      provider={currentProvider}
                      model={getCurrentModelName()}
                      responseTime={message.responseTime}
                      isVoiceEnabled={settings.voiceInputSettings.enabled}
                      isThinkingEnabled={settings.showThinking}
                      networkStatus={networkStatus}
                      onFeatureToggle={(feature) => {
                        if (feature === 'voice') {
                          // Toggle voice input
                          const newSettings = { ...settings };
                          newSettings.voiceInputSettings.enabled = !newSettings.voiceInputSettings.enabled;
                          updateSettings(newSettings);
                        } else if (feature === 'thinking') {
                          toggleShowThinking();
                        }
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    ));
  };

  // Function to handle fallback to another provider if needed
  const fallbackToAnotherProvider = (currentProvider: AIProvider, errorMessage: Message) => {
    const fallbackProviders = getAvailableFallbackProviders();
    
    // If we have more than one provider with API keys, try to fallback
    if (fallbackProviders.length > 1) {
      // Find the next available provider that's not the current one
      const nextProviderIndex = (fallbackProviders.indexOf(currentProvider) + 1) % fallbackProviders.length;
      const nextProvider = fallbackProviders[nextProviderIndex];
      
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
      
      return true;
    }
    
    // No fallback available, just show the error
    setMessages((prev) => [...prev, errorMessage]);
    return false;
  };

  // Replace line 1415 with a fixed set of models for each provider
  const getFixedModels = (provider: AIProvider) => {
    switch(provider) {
      case 'openai': return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
      case 'gemini': return ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro-vision'];
      case 'mistral': return ['mistral-tiny', 'mistral-small', 'mistral-medium'];
      case 'claude': return ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
      case 'llama': return ['llama-3-8b-instruct', 'llama-3-70b-instruct', 'llama-3-8b', 'llama-3-70b'];
      case 'deepseek': return ['deepseek-coder', 'deepseek-chat', 'deepseek-llm'];
      default: return [];
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Chat controls bar */}
      <div className="border-b dark:border-slate-700/50 p-2 sm:p-3 flex items-center justify-between sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Provider Selector */}
          <div className="relative" ref={providerMenuRef}>
            <Button 
              variant="outline" 
              size="icon"
              className={`w-8 h-8 rounded-full bg-white dark:bg-slate-800 ${showProviderMenu ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} transition-all duration-200 shadow-sm`}
              onClick={toggleProviderMenu}
              style={{color: getProviderColor(currentProvider)}}
              title={getProviderDisplayName(currentProvider)}
            >
              {getProviderIcon(currentProvider)}
            </Button>
            
            {showProviderMenu && (
              <div className="absolute top-full left-0 mt-1.5 py-1.5 px-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 w-auto flex flex-col gap-1">
                {availableProviders.map((provider) => (
                  <button
                    key={provider}
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${currentProvider === provider ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} transition-all duration-200`}
                    onClick={() => {
                      setCurrentProvider(provider);
                      setShowProviderMenu(false);
                    }}
                    style={{color: getProviderColor(provider)}}
                    title={getProviderDisplayName(provider)}
                  >
                    {getProviderIcon(provider)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Model Selector */}
          <div className="relative" ref={modelMenuRef}>
            <Button 
              variant="outline"
              size="sm"
              className={`h-8 px-2 text-xs rounded-full bg-white dark:bg-slate-800 ${showModelMenu ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} transition-all duration-200 shadow-sm`}
              onClick={toggleModelMenu}
              title="AI Model Selection"
            >
              <span className="text-xs font-medium truncate mr-1">{getCurrentModelName()}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
            
            {showModelMenu && (
              <div className="absolute z-50 top-full left-0 mt-1.5 py-1.5 px-1.5 rounded-lg shadow-lg border bg-white/95 dark:bg-slate-800/95 backdrop-blur-md dark:border-slate-700 min-w-[180px]">
                {settings[currentProvider].apiKey ? (
                  getFixedModels(currentProvider).map((model) => (
                    <button
                      key={model}
                      className={`flex items-center px-2.5 py-2 rounded-md w-full text-left ${model === (settings[currentProvider]?.selectedModel || DEFAULT_MODELS[currentProvider]) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} cursor-pointer transition-all duration-200`}
                      onClick={() => handleModelChange(model)}
                    >
                      {getProviderIcon(currentProvider)}
                      <span className="ml-2 text-xs font-medium truncate">{model}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-2.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" />
                    Configure API key
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mode Selector */}
          <div className="relative" ref={modeMenuRef}>
            <Button 
              variant="outline" 
              size="icon"
              className={`w-8 h-8 rounded-full bg-white dark:bg-slate-800 ${showModeMenu ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} transition-all duration-200 shadow-sm`}
              onClick={toggleModeMenu}
              style={{color: getModeColor(settings.chatMode)}}
              title={getModeDisplayName(settings.chatMode)}
            >
              {getModeIcon(settings.chatMode)}
            </Button>
            
            {showModeMenu && (
              <div className="absolute top-full left-0 mt-1.5 py-1.5 px-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 w-auto flex flex-col gap-1">
                {['thoughtful', 'quick', 'creative', 'technical', 'learning'].map((mode) => (
                  <button
                    key={mode}
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${settings.chatMode === mode ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'} transition-all duration-200`}
                    onClick={() => {
                      setChatMode(mode as ChatMode);
                      setShowModeMenu(false);
                    }}
                    style={{color: getModeColor(mode as ChatMode)}}
                    title={getModeDisplayName(mode as ChatMode)}
                  >
                    {getModeIcon(mode as ChatMode)}
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
            size="icon"
            className={`w-8 h-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm`}
            onClick={toggleShowThinking}
            title={settings.showThinking ? 'Hide thinking' : 'Show thinking'}
          >
            {settings.showThinking ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          <ApiDiagnostics provider={currentProvider} />
        </div>
      </div>
      
      {/* Messages Area - Add bottom padding to accommodate the fixed input */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 chat-scroll"
        style={{ paddingBottom: "calc(var(--input-height, 90px) + 20px)" }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
            {/* Enhanced circular animation */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-800 flex items-center justify-center mb-5 shadow-lg relative z-10">
                <MessageSquare className="h-10 w-10 text-white animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Start a conversation</h2>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs sm:max-w-md mb-6">
              Select your AI model and start your conversation with ChatBuddy.
            </p>
            
            {availableProviders.length === 0 ? (
              <div className="mb-8 max-w-md">
                <ApiStatusIndicator />
              </div>
            ) : (
              <>
                {/* Quick model selection for mobile - only show providers with API keys */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 w-full max-w-xs sm:max-w-md">
                  {availableProviders.map((provider: string) => (
                    <button
                      key={provider}
                      onClick={() => setCurrentProvider(provider as AIProvider)}
                      className={cn(
                        "py-3 px-2 rounded-lg flex flex-col items-center justify-center transition-all",
                        "border border-slate-200 dark:border-slate-700",
                        "hover:bg-slate-100 dark:hover:bg-slate-800",
                        currentProvider === provider ? 
                          "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-400 dark:ring-blue-600" : 
                          "bg-white dark:bg-slate-800/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                        getProviderBackgroundColor(provider as AIProvider)
                      )}>
                        {getProviderIcon(provider as AIProvider)}
                      </div>
                      <span className="text-xs font-medium">{getProviderDisplayName(provider as AIProvider)}</span>
                    </button>
                  ))}
                </div>
                
                {/* Getting started button */}
                <button
                  onClick={() => {
                    // Focus the input field to start typing
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Start typing</span>
                </button>
                
                {/* Helper suggestion chips */}
                <div className="mt-8 w-full max-w-xs sm:max-w-md">
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "Explain quantum computing",
                      "Write a short poem",
                      "Help with my resume"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(suggestion);
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }}
                        className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-1.5 px-3 rounded-full text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
          </div>
        ) : (
          <div className="py-4">
            {renderMessages()}
            <div ref={messagesEndRef} />
            
            {/* Thinking display - Only show when loading responses */}
            {isLoading && thinking && settings.showThinking && (
              <div className="p-3 my-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-xs text-slate-600 dark:text-slate-400 font-mono whitespace-pre-line">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 animate-pulse" />
                  <span className="font-semibold text-blue-500 dark:text-blue-400">Thinking...</span>
                </div>
                {thinking}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Input Area - Fixed to bottom with transition */}
      <div 
        ref={inputAreaRef}
        className={`fixed bottom-0 left-0 right-0 chat-input-fixed border-t dark:border-slate-700/50 p-0 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-lg transition-all duration-300 ease-in-out ${
          isInputVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        } max-w-screen-2xl mx-auto`}
        style={{ 
          zIndex: 20,
        }}
      >
        {/* Enhanced visual handle for better touch target */}
        <div className="w-full flex justify-center cursor-pointer touch-manipulation" onClick={() => setIsInputVisible(true)}>
          <div className="w-24 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mt-2 mb-1 hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"></div>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="relative flex items-start">
            <Textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputVisible(true)}
              className="min-h-[2.75rem] sm:min-h-[3.75rem] max-h-[16rem] sm:max-h-[20rem] w-full resize-none rounded-2xl border-1.5 px-4 pt-3 pb-2 shadow-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-400/50 dark:focus:border-blue-400 transition-all duration-200 backdrop-blur-sm pr-24 text-base sm:text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:transition-opacity focus:placeholder:opacity-50"
              style={{
                caretColor: '#3B82F6',
                fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                lineHeight: '1.5'
              }}
            />
            
            {/* Character counter overlay */}
            {input.length > 0 && (
              <div className={`absolute right-[4.5rem] sm:right-20 bottom-[0.4rem] px-1.5 py-0.5 rounded-full transition-all text-xs ${
                input.length > 4000 ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <span className="flex items-center gap-1">
                  {input.length > 4000 && <Flame className="h-3 w-3" />}
                  {input.length}/{4000}
                </span>
              </div>
            )}
            
            <div className="absolute right-3 sm:right-4 bottom-3 sm:bottom-3 flex items-center gap-2">
              {!isListening && settings.voiceInputSettings.enabled && browserSupportsSpeechRecognition && microphoneAvailable && 
               !isTyping && !isLoading && (
                <Button
                  size="icon"
                  onClick={handleVoiceInputToggle}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 shadow-sm"
                  title="Start voice input"
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
              
              {/* Add back the listening state indicator */}
              {isListening && settings.voiceInputSettings.enabled && (
                <div className="absolute top-[-3rem] left-0 right-0 flex items-center px-3 py-2 text-sm text-green-600 dark:text-green-400 animate-pulse bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg shadow-md">
                  <Mic className="h-4 w-4 mr-2" />
                  <span className="font-medium">Listening... Speak now</span>
                  <Button
                    onClick={toggleListening}
                    className="ml-auto px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300 rounded border border-red-200 dark:border-red-800/50"
                  >
                    Stop
                  </Button>
                </div>
              )}
              
              <Button
                size="icon"
                disabled={isLoading || !input.trim()}
                onClick={handleSend}
                className="h-9 w-9 sm:h-10 sm:w-10 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none shadow-md hover:shadow-lg transition-all active:scale-95"
                title="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <SendIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
          </div>
          
          {/* No speech detected message */}
          {noSpeechDetected && isListening && settings.voiceInputSettings.enabled && (
            <div className="mt-2 flex items-center px-3 py-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-md">
              <Mic className="h-4 w-4 mr-2" />
              <span className="font-medium">No speech detected. Try speaking louder or check your microphone.</span>
              <Button
                onClick={handleVoiceInputToggle}
                className="ml-2 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-300 rounded border border-green-200 dark:border-green-800/50"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {/* Microphone permission error message */}
          {micPermissionDenied && settings.voiceInputSettings.enabled && (
            <div className="mt-2 flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-md">
              <MicOff className="h-4 w-4 mr-2" />
              <span className="font-medium">
                Microphone access denied. Please enable microphone access in your browser settings.
              </span>
              <Button
                onClick={() => requestMicrophonePermission()}
                className="ml-2 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700/50"
              >
                Allow Microphone
              </Button>
            </div>
          )}
          
          {/* Browser compatibility message */}
          {!browserSupportsSpeechRecognition && settings.voiceInputSettings.enabled && (
            <div className="mt-2 flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-md">
              <MicOff className="h-4 w-4 mr-2" />
              <span className="font-medium">
                Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.
              </span>
            </div>
          )}
          
          <div className="mt-2 sm:mt-3 px-1 flex justify-between items-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="hidden xs:flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs">Enter</kbd>
                <span>to send</span>
              </div>
              <div className="hidden xs:flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs">Shift+Enter</kbd>
                <span>for new line</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getProviderGradient(currentProvider)} dark:${getProviderGradient(currentProvider, true)}`}>
                {getProviderIcon(currentProvider)}
              </div>
            </div>
          </div>
        </div>
        
        {settings.suggestionsSettings.enabled && messageHasBeenSent && !isTyping && messages.length > 0 && (
          <div className="pb-2 px-3">
            <SmartSuggestions 
              latestMessage={lastAssistantMessage} 
              messages={messages}
              onSuggestionClick={(suggestion) => {
                setInput(suggestion);
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
                // Always show the input when selecting a suggestion
                setIsInputVisible(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Floating action button to show input when hidden */}
      {!isInputVisible && (
        <button 
          onClick={() => setIsInputVisible(true)} 
          className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-4 shadow-lg transition-all z-30 animate-bounceIn hover:from-blue-600 hover:to-indigo-700"
          aria-label="Show message input"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Voice input listening indicator */}
      {isListening && settings.voiceInputSettings.enabled && (
        <div className="absolute bottom-24 left-0 right-0 mx-auto w-fit px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 z-10">
          <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
            <Mic className="h-4 w-4 mr-2 animate-pulse" />
            Listening... speak clearly
          </p>
        </div>
      )}
      
      {/* No speech detected message */}
      {noSpeechDetected && isListening && settings.voiceInputSettings.enabled && (
        <div className="absolute bottom-24 left-0 right-0 mx-auto w-fit px-4 py-2 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800 z-10">
          <div className="flex flex-col items-center">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
              <VolumeX className="h-4 w-4 mr-2" />
              No speech detected. Try speaking louder or check your microphone.
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1 text-amber-600 dark:text-amber-400 h-7" 
              onClick={() => handleVoiceInputToggle()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {/* Microphone permission denied message */}
      {micPermissionDenied && settings.voiceInputSettings.enabled && (
        <div className="absolute bottom-24 left-0 right-0 mx-auto w-fit px-4 py-2 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 z-10">
          <div className="flex flex-col items-center">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <MicOff className="h-4 w-4 mr-2" />
              Microphone access denied. Please enable microphone access in your browser settings.
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1 text-red-600 dark:text-red-400 h-7" 
              onClick={() => requestMicrophonePermission()}
            >
              Allow Microphone
            </Button>
          </div>
        </div>
      )}
      
      {/* Browser compatibility message */}
      {!browserSupportsSpeechRecognition && settings.voiceInputSettings.enabled && (
        <div className="absolute bottom-24 left-0 right-0 mx-auto w-fit px-4 py-2 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800 z-10">
          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Your browser doesn't support voice input. Please try Chrome, Edge, or Safari.
          </p>
        </div>
      )}
    </div>
  );
}

// Add CSS for animations
const styles = `
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes bounceIn {
  0% { 
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) translateY(-10px);
  }
  70% { transform: scale(0.9) translateY(5px); }
  100% { transform: scale(1) translateY(0); }
}

.animate-bounceIn {
  animation: bounceIn 0.5s ease-out forwards;
}

@keyframes pulseInput {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3); }
  70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.focus-visible:focus {
  animation: pulseInput 2s infinite;
}

/* Enhance textarea styling */
textarea::placeholder {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

textarea:focus::placeholder {
  opacity: 0.4;
}

textarea {
  transition: all 0.2s ease;
}

/* Prevent iOS Safari address bar from affecting the fixed position */
@supports (-webkit-touch-callout: none) {
  .chat-input-fixed {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
  }
}

/* Custom scrollbar for chat area */
.chat-scroll::-webkit-scrollbar {
  width: 6px;
}

.chat-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.chat-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
}

.chat-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Add specific styles for textarea on different device sizes */
@media (max-width: 640px) {
  textarea {
    font-size: 16px !important; /* Prevent zoom on iOS */
    padding-top: 12px !important;
    padding-bottom: 8px !important;
  }
}

@media (prefers-color-scheme: dark) {
  .chat-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .chat-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
  }
  
  .chat-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

/* Add xs breakpoint for very small mobile screens */
@media (min-width: 440px) {
  .xs\\:flex {
    display: flex;
  }
  
  .xs\\:hidden {
    display: none;
  }
}
`;

// Inject the styles into the document
if (typeof document !== 'undefined') {
  // Check if the style tag already exists
  const existingStyle = document.getElementById('chat-animations');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.id = 'chat-animations';
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
  }
}
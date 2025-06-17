"use client"

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from 'react';
import { callAI, ChatMessage } from './api';
import { extractSuggestionsFromText, getGeneralSuggestions, generateFollowUpQuestion } from './suggestions';

/**
 * Combines class names with Tailwind CSS using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string using Intl.DateTimeFormat
 */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
}

/**
 * Truncates text with ellipsis after a specified number of characters
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates animation keyframes for CSS animations
 */
export const animationKeyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  slideInUp: `
    @keyframes slideInUp {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,
  spin: `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  `
};

/**
 * Injects global CSS styles into the document head
 */
export function injectGlobalStyles(styles: string): () => void {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
  
  return () => {
    document.head.removeChild(styleElement);
  };
}

/**
 * Custom hook for responsive design breakpoints
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('');
  
  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 480) {
        setBreakpoint('xs');
      } else if (width < 640) {
        setBreakpoint('sm');
      } else if (width < 768) {
        setBreakpoint('md');
      } else if (width < 1024) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };
    
    // Initial check
    checkBreakpoint();
    
    // Add event listener
    const debouncedCheck = debounce(checkBreakpoint, 100);
    window.addEventListener('resize', debouncedCheck);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);
  
  return breakpoint;
}

/**
 * Determines if the current device is touch-enabled
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    const isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;
    
    setIsTouch(isTouchDevice);
  }, []);
  
  return isTouch;
}

/**
 * Generate accessible aria attributes for common components
 */
export function getAriaAttributes(role: string, props: Record<string, any> = {}) {
  const baseAttrs: Record<string, any> = { role };
  
  switch (role) {
    case 'button':
      return {
        ...baseAttrs,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            props.onClick?.(e);
          }
        },
        ...props
      };
    case 'toggle':
    case 'switch':
      return {
        ...baseAttrs,
        role: 'switch',
        'aria-checked': props.checked || false,
        tabIndex: 0,
        ...props
      };
    case 'tab':
      return {
        ...baseAttrs,
        'aria-selected': props.selected || false,
        tabIndex: props.selected ? 0 : -1,
        ...props
      };
    default:
      return { ...baseAttrs, ...props };
  }
}

/**
 * Generates global responsive styles for the application
 */
export const getResponsiveStyles = () => `
  /* Improved focus styles for accessibility */
  :focus-visible {
    outline: 2px solid #3b82f6 !important;
    outline-offset: 2px !important;
  }
  
  /* Touch target enhancements for mobile */
  @media (hover: none) {
    .touch-target {
      min-height: 44px;
      min-width: 44px;
    }
    
    button:not(.touch-exempt),
    a:not(.touch-exempt) {
      min-height: 44px;
      min-width: 44px;
    }
  }
  
  /* Animation utility classes */
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .animate-fade-out {
    animation: fadeOut 0.3s ease-in-out;
  }
  
  .animate-slide-in-up {
    animation: slideInUp 0.3s ease-out;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s infinite ease-in-out;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .animate-bounce {
    animation: bounce 1s infinite ease-in-out;
  }
  
  /* Extra small screen utilities */
  @media (max-width: 480px) {
    .xs\\:hidden {
      display: none;
    }
    
    .xs\\:block {
      display: block;
    }
    
    .xs\\:flex {
      display: flex;
    }
    
    .xs\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .xs\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .xs\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    .xs\\:text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    
    .xs\\:p-2 {
      padding: 0.5rem;
    }
    
    .xs\\:gap-1 {
      gap: 0.25rem;
    }
  }
`;

/**
 * Returns appropriate loading and success states for async actions
 */
export function useAsyncState() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const runAsync = async (fn: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    try {
      await fn();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return { isLoading, isSuccess, error, runAsync };
}

/**
 * Hook to ensure responsiveness and enhance UI for both mobile and desktop
 */
export function useEnhancedUI() {
  const breakpoint = useBreakpoint();
  const isTouch = useTouchDevice();
  
  useEffect(() => {
    // Combine all animation keyframes
    const keyframesStyles = Object.values(animationKeyframes).join('\n');
    
    // Inject global styles
    const cleanupFn = injectGlobalStyles(keyframesStyles + getResponsiveStyles());
    
    return cleanupFn;
  }, []);
  
  // Return useful UI enhancement utilities
  return {
    breakpoint,
    isTouch,
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl'].includes(breakpoint),
  };
}

/**
 * Helper for smooth scrolling to elements
 */
export function scrollToElement(elementId: string, offset = 0) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const top = element.getBoundingClientRect().top + window.pageYOffset + offset;
  
  window.scrollTo({
    top,
    behavior: 'smooth'
  });
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ClientOnly component to only render content on the client side
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

// Interface for code blocks extracted from text
export interface CodeBlock {
  code: string;
  language: string;
  preBlockText: string;
  postBlockText: string;
}

// Function to detect and parse code blocks from text
export function parseCodeBlocks(text: string): CodeBlock[] {
  // Regular expression to match markdown code blocks with various formats:
  // 1. Standard ```language\ncode```
  // 2. No language specified ```\ncode```
  // 3. Handles optional spaces between backticks and language
  // 4. Handles language with or without newline
  const codeBlockRegex = /```([a-zA-Z0-9_+\-.*]*)?([\s\n])([\s\S]*?)```/g;
  
  const codeBlocks: CodeBlock[] = [];
  let lastIndex = 0;
  let preBlockText = '';
  let match;
  
  // Find all code blocks in the text
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Store the text before the code block
    preBlockText = text.substring(lastIndex, match.index);
    
    // Process the code block
    const language = (match[1] || 'plaintext').trim();
    // The actual code is in group 3 after the newline
    const code = match[3].trim();
    
    // Update last index to the end of this match
    lastIndex = match.index + match[0].length;
    
    // Store the text after the code block (will be overwritten if there are more code blocks)
    const postBlockText = text.substring(lastIndex);
    
    codeBlocks.push({
      code,
      language,
      preBlockText,
      postBlockText
    });
  }
  
  // If no code blocks were found, return the original text as non-code
  if (codeBlocks.length === 0) {
    return [];
  }
  
  // Process each block to fix up the pre/post text
  // This handles multiple consecutive code blocks correctly
  for (let i = 1; i < codeBlocks.length; i++) {
    const prevBlock = codeBlocks[i - 1];
    const currentBlock = codeBlocks[i];
    
    // The post text of the previous block becomes the pre text of the current block
    prevBlock.postBlockText = currentBlock.preBlockText;
    // Current block pre text is already set correctly
  }
  
  // Add any remaining text after the last code block
  if (lastIndex < text.length) {
    const lastBlock = codeBlocks[codeBlocks.length - 1];
    lastBlock.postBlockText = text.substring(lastIndex);
  }
  
  return codeBlocks;
}

// Check if content contains code - for deciding if we should apply special formatting
export function containsCodeBlock(text: string): boolean {
  const codeBlockRegex = /```([a-zA-Z0-9_+\-.*]*)?([\s\n])([\s\S]*?)```/;
  return codeBlockRegex.test(text);
}

// Function to detect if a message is likely a coding question
export function isCodingQuestion(text: string): boolean {
  const codingKeywords = [
    // General programming terms
    'code', 'function', 'class', 'method', 'api', 'programming', 'syntax', 'snippet',
    
    // Languages
    'javascript', 'js', 'typescript', 'ts', 'python', 'java', 'c#', 'c++', 'ruby', 'php', 'go',
    
    // JavaScript specific
    'es6', 'es2015', 'es2020', 'es2021', 'es2022', 'ecmascript', 'node', 'nodejs', 'npm', 'yarn', 'pnpm',
    'promise', 'async', 'await', 'callback', 'closure', 'prototype', 'this', 'arrow function',
    'spread', 'destructuring', 'module', 'import', 'export', 'json', 'dom', 'event', 'listener',
    
    // Frameworks and libraries
    'react', 'angular', 'vue', 'svelte', 'next', 'nuxt', 'express', 'jquery', 'axios', 'fetch',
    'redux', 'mobx', 'zustand', 'recoil', 'webpack', 'vite', 'rollup', 'babel', 'eslint', 'jest',
    'mocha', 'chai', 'cypress', 'playwright', 'tailwind', 'bootstrap', 'material ui', 'chakra',
    
    // Web technologies
    'component', 'html', 'css', 'scss', 'less', 'styled', 'animation', 'transition', 'grid', 'flexbox',
    'responsive', 'media query', 'selector', 'pseudo', 'specificity', 'variable', 'property',
    
    // Data structures and patterns
    'algorithm', 'data structure', 'framework', 'library', 'pattern', 'middleware',
    'hook', 'state', 'props', 'context', 'render', 'component', 'virtual dom'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check for common coding question patterns
  if (lowerText.includes('how do i') || 
      lowerText.includes('how to') || 
      lowerText.includes('can you help') || 
      lowerText.includes('example of') ||
      lowerText.includes('write a') ||
      lowerText.includes('implement a') ||
      lowerText.includes('create a') ||
      lowerText.includes('fix this') ||
      lowerText.includes('debug this') ||
      lowerText.includes('explain this code') ||
      lowerText.includes('what does this') ||
      lowerText.includes('error in my')) {
    
    // Check if it contains any coding keywords
    return codingKeywords.some(keyword => lowerText.includes(keyword));
  }
  
  // Check if it contains code blocks already
  if (containsCodeBlock(text)) {
    return true;
  }
  
  // Check for specific code patterns that suggest code content
  const codePatterns = [
    /function\s*\w*\s*\(/i, // function declarations
    /const|let|var\s+\w+\s*=/i, // variable declarations
    /import\s+[\w\s{}]+\s+from/i, // ES6 imports
    /export\s+/i, // ES6 exports
    /class\s+\w+/i, // class declarations
    /if\s*\(.+\)\s*{/i, // if statements
    /for\s*\(.+\)\s*{/i, // for loops
    /=>/i, // arrow functions
    /\.then\s*\(/i, // promise chains
    /\$\(.*\)\./i, // jQuery patterns
    /document\.get/i, // DOM manipulation
    /console\.log/i, // console logs
    /\<\w+(\s+\w+=".*")*\s*\>/i, // HTML tags
    /\{\s*\w+:.*\}/i, // Object literals
  ];
  
  return codePatterns.some(pattern => pattern.test(text));
}

// Chat history storage
export type ChatHistoryItem = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export const LOCAL_STORAGE_KEYS = {
  CHAT_HISTORY: 'chatHistory',
  SETTINGS: 'aiSettings',
  OPENAI_KEY: 'NEXT_PUBLIC_OPENAI_API_KEY',
  GEMINI_KEY: 'NEXT_PUBLIC_GEMINI_API_KEY',
  MISTRAL_KEY: 'NEXT_PUBLIC_MISTRAL_API_KEY',
  CLAUDE_KEY: 'NEXT_PUBLIC_CLAUDE_API_KEY',
  LLAMA_KEY: 'NEXT_PUBLIC_LLAMA_API_KEY',
  DEEPSEEK_KEY: 'NEXT_PUBLIC_DEEPSEEK_API_KEY',
};

// Smart suggestions utilities

export const saveChatHistory = (messages: ChatHistoryItem[]) => {
  if (typeof window !== 'undefined') {
    try {
      const history = JSON.stringify(messages);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY, history);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
};

export const loadChatHistory = (): ChatHistoryItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const history = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY);
      if (history) {
        return JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }
  return [];
};

// Common topics/categories for prompt recommendations
export const PROMPT_CATEGORIES = {
  CODING: 'Coding',
  WRITING: 'Writing',
  LEARNING: 'Learning',
  CREATIVE: 'Creative',
  PRODUCTIVITY: 'Productivity',
  ANALYSIS: 'Analysis',
  PLANNING: 'Planning'
};

// Popular pre-defined prompts by category
export const RECOMMENDED_PROMPTS = {
  [PROMPT_CATEGORIES.CODING]: [
    "Help me debug this code: [paste code]",
    "Explain how this algorithm works: [paste algorithm]",
    "Convert this code from [language] to [target language]",
    "Optimize this function for better performance",
    "Suggest a better way to implement this feature"
  ],
  [PROMPT_CATEGORIES.WRITING]: [
    "Help me write a professional email about [topic]",
    "Proofread and improve this text: [paste text]",
    "Summarize this article in 3 bullet points",
    "Create an outline for an essay about [topic]",
    "Write a compelling introduction for [topic]"
  ],
  [PROMPT_CATEGORIES.LEARNING]: [
    "Explain [concept] as if I'm a complete beginner",
    "What are the key points I should know about [topic]?",
    "Create a study plan for learning [subject]",
    "Compare and contrast [concept A] and [concept B]",
    "What are common misconceptions about [topic]?"
  ],
  [PROMPT_CATEGORIES.CREATIVE]: [
    "Generate 5 creative ideas for [project/goal]",
    "Help me brainstorm names for [product/business]",
    "Write a short story about [character/setting]",
    "Create a metaphor that explains [concept]",
    "Design a fictional scenario where [situation]"
  ],
  [PROMPT_CATEGORIES.PRODUCTIVITY]: [
    "Create a to-do list template for [activity]",
    "Help me prioritize these tasks: [list tasks]",
    "Design a daily routine to improve [goal]",
    "Create a project timeline for [project]",
    "Suggest ways to automate [repetitive task]"
  ],
  [PROMPT_CATEGORIES.ANALYSIS]: [
    "Analyze the pros and cons of [topic/decision]",
    "What are potential risks and benefits of [option]?",
    "Help me interpret this data: [paste data]",
    "What insights can be drawn from [information]?",
    "Compare these options: [list options]"
  ],
  [PROMPT_CATEGORIES.PLANNING]: [
    "Help me plan a [event/trip] to [location]",
    "Create a budget plan for [project/goal]",
    "Develop a strategy for [business/personal goal]",
    "Design a 30-day challenge for [skill/habit]",
    "Make a meal plan for [dietary preference]"
  ]
};

// Enhanced version of extractTopics - uses more advanced extraction techniques
export const extractTopics = (messages: ChatHistoryItem[]): string[] => {
  // Extract all user messages and recent assistant responses
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase());
  
  // Get the 3 most recent assistant messages to identify current context
  const recentAssistantMessages = messages
    .filter(m => m.role === 'assistant')
    .slice(-3)
    .map(m => m.content.toLowerCase());
  
  // Common filler words to exclude
  const excludeWords = [
    'what', 'when', 'where', 'which', 'how', 'why', 'who', 'this', 'that', 
    'these', 'those', 'with', 'from', 'have', 'has', 'had', 'were', 'was', 
    'would', 'could', 'should', 'there', 'their', 'they', 'about', 'into', 
    'just', 'more', 'some', 'then', 'than', 'very', 'such', 'will', 'too'
  ];
  
  // Words and phrases that suggest topics from all message content
  const combinedText = [...userMessages, ...recentAssistantMessages].join(' ');
  
  // Extract words (better implementation)
  // Split by spaces, punctuation, etc., then filter out short words and common filler words
  const words = combinedText
    .split(/[\s,.!?;:()\[\]{}'"\/\\<>-]+/)
    .map(word => word.trim().toLowerCase())
    .filter(word => 
      word.length > 3 && 
      !excludeWords.includes(word)
    );
  
  // Count occurrences
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Also extract two-word phrases for more specific topics
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 3 && words[i+1].length > 3) {
      phrases.push(`${words[i]} ${words[i+1]}`);
    }
  }
  
  // Count phrase occurrences
  const phraseCounts: Record<string, number> = {};
  phrases.forEach(phrase => {
    phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
  });
  
  // Identify programming/coding context - check for common programming terms
  const programmingTerms = ['code', 'function', 'program', 'api', 'bug', 'variable', 'class', 
    'object', 'array', 'string', 'number', 'boolean', 'error', 'framework', 'library', 
    'syntax', 'compiler', 'runtime', 'debug', 'algorithm', 'data', 'javascript', 'python', 
    'java', 'typescript', 'css', 'html', 'react', 'node', 'express', 'component'];
  
  const isProgrammingContext = programmingTerms.some(term => 
    combinedText.includes(term)
  );
  
  // Identify writing context
  const writingTerms = ['write', 'essay', 'article', 'blog', 'post', 'content', 'book', 
    'story', 'paragraph', 'sentence', 'grammar', 'edit', 'revise', 'proofread', 'summarize', 
    'outline', 'draft', 'thesis', 'conclusion', 'introduction', 'author'];
  
  const isWritingContext = writingTerms.some(term => 
    combinedText.includes(term)
  );
  
  // Create a weighted list combining both single words and phrases
  const weightedTopics: [string, number][] = [
    ...Object.entries(wordCounts) as [string, number][],
    ...Object.entries(phraseCounts).map(([phrase, count]) => [phrase, count * 1.5] as [string, number]) // Weight phrases higher
  ];
  
  // Sort by frequency/weight
  weightedTopics.sort((a, b) => b[1] - a[1]);
  
  // Take the top topics
  let topTopics = weightedTopics
    .slice(0, 10)
    .map(([topic]) => topic);
  
  // If we're in a specific context, add some relevant terms
  if (isProgrammingContext) {
    // Add programming-specific topics if they're not already in the list
    const programmingTopics = ['code optimization', 'debugging', 'refactoring', 'best practices', 'clean code'];
    topTopics = [...new Set([...topTopics, ...programmingTopics.slice(0, 2)])];
  }
  
  if (isWritingContext) {
    // Add writing-specific topics if they're not already in the list
    const writingTopics = ['grammar check', 'proofreading', 'summarize', 'paraphrase', 'content ideas'];
    topTopics = [...new Set([...topTopics, ...writingTopics.slice(0, 2)])];
  }
  
  return topTopics.slice(0, 5); // Return at most 5 topics
};

// Enhanced follow-up questions generator
export const generateFollowUpQuestions = (latestMessage: string): string[] => {
  const messageLower = latestMessage.toLowerCase();
  
  // Check for coding/programming context
  if (containsCodeBlock(latestMessage) || isCodingQuestion(messageLower)) {
    return [
      "Can you explain how this code works step by step?",
      "How would you optimize this code?",
      "What edge cases should I consider?",
      "Can you add error handling to this code?",
      "How would you test this implementation?"
    ].slice(0, 3); // Return only 3 of these options
  }
  
  // Check for explanations or educational content
  if (messageLower.includes('explain') || messageLower.includes('understand') || 
      messageLower.includes('mean') || messageLower.includes('concept')) {
    return [
      "Can you provide a simpler explanation?",
      "Could you give a practical example of this?",
      "How does this compare to similar concepts?",
      "What are common misconceptions about this?"
    ].slice(0, 3);
  }
  
  // Check for problem/error context
  if (messageLower.includes('error') || messageLower.includes('problem') || 
      messageLower.includes('issue') || messageLower.includes('bug') ||
      messageLower.includes('wrong')) {
    return [
      "Can you share the exact error message?",
      "What have you tried so far to fix this?",
      "When did you first notice this issue?",
      "Does the problem happen consistently or intermittently?"
    ].slice(0, 3);
  }
  
  // Check for alternatives/options context
  if (messageLower.includes('different') || messageLower.includes('alternative') || 
      messageLower.includes('option') || messageLower.includes('other way') ||
      messageLower.includes('instead')) {
    return [
      "What are the pros and cons of each approach?",
      "Which option would be best for my specific case?",
      "Is there a recommended industry standard for this?",
      "What factors should I consider when choosing?"
    ].slice(0, 3);
  }
  
  // Check for writing/content context
  if (messageLower.includes('write') || messageLower.includes('essay') || 
      messageLower.includes('article') || messageLower.includes('content') ||
      messageLower.includes('blog') || messageLower.includes('email')) {
    return [
      "Who is the target audience for this content?",
      "Would you like me to suggest improvements to the structure?",
      "Should I focus on any particular aspects or tone?",
      "What's the main purpose of this piece?"
    ].slice(0, 3);
  }
  
  // Default follow-up questions - more thoughtful than previous version
  return [
    "Would you like me to elaborate on any specific point?",
    "Is there a particular aspect you'd like more information about?",
    "Did this address your question, or would you like a different approach?",
    "Would a practical example help clarify this?"
  ].slice(0, 3);
};

// Enhanced prompts suggestion based on history
export const suggestPromptsBasedOnHistory = (history: ChatHistoryItem[]): string[] => {
  const topics = extractTopics(history);
  
  // Create more thoughtful suggested prompts based on topics
  const suggestedPrompts: string[] = [];
  
  topics.forEach(topic => {
    const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    
    // Add various prompt types for each topic
    suggestedPrompts.push(`Tell me more about ${topic}`);
    
    // Check if it's likely a technical/programming topic
    if (['code', 'function', 'api', 'programming', 'javascript', 'python', 'data', 
         'algorithm', 'database', 'framework', 'library'].some(term => topic.includes(term))) {
      suggestedPrompts.push(`Show me an example of ${topic} with explanation`);
      suggestedPrompts.push(`What are best practices for ${topic}?`);
    }
    
    // Check if it's likely a concept or learning topic
    else if (['concept', 'theory', 'principle', 'method', 'approach', 'technique', 
              'strategy', 'system', 'model'].some(term => topic.includes(term))) {
      suggestedPrompts.push(`Explain ${topic} with a simple example`);
      suggestedPrompts.push(`What are the key aspects of ${topic}?`);
    }
    
    // General purpose suggestions
    else {
      suggestedPrompts.push(`What are the most important things to know about ${topic}?`);
      suggestedPrompts.push(`Compare different approaches to ${topic}`);
    }
  });
  
  // Remove duplicates and limit to 5 suggestions
  return [...new Set(suggestedPrompts)].slice(0, 5);
};

// New function to recommend popular prompts based on detected context
export const getRecommendedPrompts = (history: ChatHistoryItem[]): string[] => {
  if (history.length === 0) {
    // No history available, return a mix of popular prompts from different categories
    return Object.values(RECOMMENDED_PROMPTS)
      .flatMap(prompts => prompts.slice(0, 1))
      .slice(0, 5);
  }
  
  // Get the most recent messages to determine context
  const recentMessages = history.slice(-5);
  const recentContent = recentMessages.map(msg => msg.content.toLowerCase()).join(' ');
  
  // Determine which categories are most relevant based on keywords
  const categoryScores: Record<string, number> = {
    [PROMPT_CATEGORIES.CODING]: 0,
    [PROMPT_CATEGORIES.WRITING]: 0,
    [PROMPT_CATEGORIES.LEARNING]: 0,
    [PROMPT_CATEGORIES.CREATIVE]: 0,
    [PROMPT_CATEGORIES.PRODUCTIVITY]: 0,
    [PROMPT_CATEGORIES.ANALYSIS]: 0,
    [PROMPT_CATEGORIES.PLANNING]: 0
  };
  
  // Keywords that suggest each category
  const categoryKeywords: Record<string, string[]> = {
    [PROMPT_CATEGORIES.CODING]: ['code', 'function', 'bug', 'error', 'programming', 'developer', 'api', 
      'javascript', 'python', 'database', 'algorithm', 'variable', 'class', 'frontend', 'backend'],
    [PROMPT_CATEGORIES.WRITING]: ['write', 'edit', 'essay', 'article', 'blog', 'content', 'proofread', 
      'grammar', 'paragraph', 'sentence', 'word', 'text', 'document', 'email', 'letter'],
    [PROMPT_CATEGORIES.LEARNING]: ['learn', 'understand', 'explain', 'concept', 'knowledge', 'education', 
      'study', 'tutorial', 'course', 'lesson', 'teach', 'student', 'principles', 'fundamentals'],
    [PROMPT_CATEGORIES.CREATIVE]: ['creative', 'idea', 'brainstorm', 'design', 'imagine', 'inspire', 
      'story', 'novel', 'character', 'plot', 'innovative', 'artistic', 'fiction', 'create'],
    [PROMPT_CATEGORIES.PRODUCTIVITY]: ['productivity', 'efficient', 'organize', 'schedule', 'task', 'todo', 
      'time', 'management', 'workflow', 'process', 'optimize', 'streamline', 'prioritize'],
    [PROMPT_CATEGORIES.ANALYSIS]: ['analyze', 'examine', 'evaluate', 'assess', 'review', 'critique', 
      'feedback', 'improve', 'compare', 'contrast', 'strengths', 'weaknesses', 'data', 'insights'],
    [PROMPT_CATEGORIES.PLANNING]: ['plan', 'strategy', 'goal', 'objective', 'milestone', 'project', 
      'timeline', 'schedule', 'prepare', 'organize', 'outline', 'roadmap', 'future']
  };
  
  // Score each category based on keyword matches
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (recentContent.includes(keyword)) {
        categoryScores[category] += 1;
      }
    });
  });
  
  // Sort categories by score
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);
  
  // Get top 2 categories (or fewer if there are fewer matches)
  const topCategories = sortedCategories.filter(category => categoryScores[category] > 0).slice(0, 2);
  
  // If no clear categories, use a default mix
  if (topCategories.length === 0) {
    topCategories.push(PROMPT_CATEGORIES.LEARNING, PROMPT_CATEGORIES.ANALYSIS);
  }
  
  // Get prompts from the top categories
  const recommendedPrompts: string[] = [];
  topCategories.forEach(category => {
    const promptsFromCategory = RECOMMENDED_PROMPTS[category].slice(0, 3);
    recommendedPrompts.push(...promptsFromCategory);
  });
  
  // Return a mix of prompts (max 5)
  return recommendedPrompts.slice(0, 5);
};

// Function to generate AI-powered suggestions
export const generateAISuggestions = async (
  history: ChatHistoryItem[],
  apiProvider: string,
  apiKey: string
): Promise<{
  followUpQuestions: string[],
  topicSuggestions: string[],
  recommendedPrompts: string[]
}> => {
  if (history.length === 0) {
    // If no history, return empty suggestions
    return {
      followUpQuestions: [],
      topicSuggestions: [],
      recommendedPrompts: []
    };
  }

  // Create fallback suggestions in case of errors
  const fallbackSuggestions = {
    followUpQuestions: generateFollowUpQuestions(history[history.length - 1]?.content || ''),
    topicSuggestions: suggestPromptsBasedOnHistory(history),
    recommendedPrompts: getRecommendedPrompts(history)
  };

  // Skip if API key is missing for the provider
  if (!apiKey) {
    console.log(`No API key available for ${apiProvider}, using rule-based suggestions instead`);
    return fallbackSuggestions;
  }

  // Maximum number of retries
  const MAX_RETRIES = 2;
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      // Format the chat history into a simple text prompt for more reliable processing
      let promptText = 'Based on the following conversation history, generate helpful suggestions:\n\n';
      
      // Add conversation history
      history.forEach(msg => {
        const role = msg.role === 'assistant' ? 'AI' : 'User';
        promptText += `${role}: ${msg.content}\n\n`;
      });
      
      promptText += `
Please analyze the conversation above and generate three types of suggestions:
1. Follow-up Questions: 2-3 questions that naturally continue the most recent conversation
2. Topic Suggestions: 2-3 prompts related to topics discussed in the conversation history
3. Recommended Prompts: 2-3 useful prompt templates that would be helpful based on the user's interests and needs

Format your response as JSON with these three arrays:
{
  "followUpQuestions": ["question 1", "question 2", ...],
  "topicSuggestions": ["suggestion 1", "suggestion 2", ...],
  "recommendedPrompts": ["prompt 1", "prompt 2", ...]
}

Keep all suggestions concise, clear, and directly usable by the user.
IMPORTANT: Your response must be valid JSON that can be parsed directly.`;

      // Create settings object with provider-specific configurations
      const apiSettings: any = {
        chatMode: 'thoughtful', // Default chat mode
        [apiProvider]: {
          apiKey,
          temperature: 0.7,
          maxTokens: 1000
        }
      };
      
      // For Mistral, set specific model
      if (apiProvider === 'mistral') {
        // Create a fresh object with only the expected properties
        apiSettings.mistral = {
          apiKey: apiKey,
          temperature: 0.7,
          maxTokens: 500,
          selectedModel: 'mistral-small'
        };
      }
      
      // Create API messages
      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an AI assistant helping generate smart conversation suggestions.`
        },
        {
          role: 'user',
          content: promptText
        }
      ];
      
      console.log(`Calling AI with provider: ${apiProvider}`);
      const { callAI } = await import('./api');
      const result = await callAI(apiMessages, apiProvider as any, apiSettings);
      
      if (!result || typeof result !== 'string') {
        console.error('Invalid response from AI API - not a string');
        throw new Error('Invalid response format');
      }
      
      // Parse the result - it should be JSON
      try {
        // Try to extract JSON from the response if it contains other text
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          
          // Validate response shape
          if (!suggestions || typeof suggestions !== 'object') {
            console.error('Invalid response format - not an object');
            throw new Error('Invalid JSON object format');
          }
          
          // Ensure all fields are arrays (or empty arrays if missing)
          const followUpQuestions = Array.isArray(suggestions.followUpQuestions) 
            ? suggestions.followUpQuestions.slice(0, 3) 
            : [];
            
          const topicSuggestions = Array.isArray(suggestions.topicSuggestions) 
            ? suggestions.topicSuggestions.slice(0, 3) 
            : [];
            
          const recommendedPrompts = Array.isArray(suggestions.recommendedPrompts) 
            ? suggestions.recommendedPrompts.slice(0, 3) 
            : [];
          
          // Filter and validate each suggestion
          const validResponse = {
            followUpQuestions: followUpQuestions
              .filter((q: any) => typeof q === 'string' && q.trim().length > 0)
              .map((q: string) => q.trim()),
            topicSuggestions: topicSuggestions
              .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
              .map((t: string) => t.trim()),
            recommendedPrompts: recommendedPrompts
              .filter((p: any) => typeof p === 'string' && p.trim().length > 0)
              .map((p: string) => p.trim())
          };
          
          // Check if we have at least some valid suggestions
          if (validResponse.followUpQuestions.length === 0 && 
              validResponse.topicSuggestions.length === 0 && 
              validResponse.recommendedPrompts.length === 0) {
            console.warn('No valid suggestions found in AI response');
            return fallbackSuggestions;
          }
          
          return validResponse;
        } else {
          console.error('No JSON found in response:', result.substring(0, 200));
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing AI suggestions:', parseError);
        
        // Increase retry counter and try again if not exceeded max retries
        retries++;
        
        if (retries > MAX_RETRIES) {
          // Fallback to rule-based suggestions on final error
          console.log('Falling back to rule-based suggestions after parsing failures');
          return fallbackSuggestions;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Retrying AI suggestion generation (attempt ${retries} of ${MAX_RETRIES})`);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      
      // Increase retry counter and try again if not exceeded max retries
      retries++;
      
      if (retries > MAX_RETRIES) {
        // Fallback to rule-based suggestions on final error
        console.log('Falling back to rule-based suggestions after API failures');
        return fallbackSuggestions;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Retrying AI suggestion generation (attempt ${retries} of ${MAX_RETRIES})`);
    }
  }
  
  // This should not be reached due to the returns in the try/catch blocks,
  // but is added as a fallback just in case
  return fallbackSuggestions;
};

/**
 * Get background color class for a provider
 */
export function getProviderBackgroundColor(provider: string): string {
  switch (provider) {
    case 'openai':
      return 'bg-green-600 dark:bg-green-700';
    case 'gemini':
      return 'bg-blue-600 dark:bg-blue-700';
    case 'claude':
      return 'bg-purple-600 dark:bg-purple-700';
    case 'mistral':
      return 'bg-cyan-600 dark:bg-cyan-700';
    case 'llama':
      return 'bg-amber-600 dark:bg-amber-700';
    default:
      return 'bg-slate-600 dark:bg-slate-700';
  }
}

/**
 * Get display name for a provider
 */
export function getProviderDisplayName(provider: string): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'gemini':
      return 'Gemini';
    case 'claude':
      return 'Claude';
    case 'mistral':
      return 'Mistral';
    case 'llama':
      return 'Llama';
    default:
      return 'Unknown';
  }
}

// Re-export suggestion functions from suggestions.ts
export { extractSuggestionsFromText, getGeneralSuggestions, generateFollowUpQuestion };

// Supabase connection test utility
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  statusCode?: number;
  error?: string;
  latency?: number;
}> => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Cannot test connection in server context' };
  }

  try {
    const startTime = performance.now();
    
    // Basic health check - try to fetch a small amount of data
    const response = await fetch('https://gphdrsfbypnckxbdjjap.supabase.co/rest/v1/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
    });
    
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    
    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        error: `Supabase returned status: ${response.status}`,
        latency
      };
    }
    
    return {
      success: true,
      statusCode: response.status,
      latency
    };
  } catch (error) {
    console.error('Connection test error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
}; 
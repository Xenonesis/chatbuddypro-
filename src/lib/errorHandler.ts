'use client';

import { toast } from '@/components/ui/use-toast';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories for better handling
export type ErrorCategory = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'api_key'
  | 'database'
  | 'export'
  | 'import'
  | 'unknown';

// Enhanced error interface
export interface EnhancedError extends Error {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  userMessage?: string;
  suggestions?: string[];
  retryable?: boolean;
}

// Error analysis result
export interface ErrorAnalysis {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  technicalMessage: string;
  suggestions: string[];
  retryable: boolean;
  code?: string;
}

// Create enhanced error
export function createEnhancedError(
  message: string,
  options: Partial<EnhancedError> = {}
): EnhancedError {
  const error = new Error(message) as EnhancedError;
  Object.assign(error, options);
  return error;
}

// Analyze error and provide user-friendly information
export function analyzeError(error: Error | EnhancedError): ErrorAnalysis {
  const message = error.message.toLowerCase();
  
  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return {
      category: 'network',
      severity: 'medium',
      userMessage: 'Connection issue detected',
      technicalMessage: error.message,
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Contact support if the issue persists'
      ],
      retryable: true
    };
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401') || message.includes('auth')) {
    return {
      category: 'authentication',
      severity: 'high',
      userMessage: 'Authentication required',
      technicalMessage: error.message,
      suggestions: [
        'Please log in again',
        'Check if your session has expired',
        'Clear browser cache and cookies'
      ],
      retryable: false
    };
  }
  
  // API key errors
  if (message.includes('api key') || message.includes('invalid key') || message.includes('403')) {
    return {
      category: 'api_key',
      severity: 'high',
      userMessage: 'API key issue detected',
      technicalMessage: error.message,
      suggestions: [
        'Check your API key in settings',
        'Verify the API key is valid and active',
        'Ensure you have sufficient credits/quota'
      ],
      retryable: false
    };
  }
  
  // Database errors
  if (message.includes('database') || message.includes('supabase') || message.includes('sql')) {
    return {
      category: 'database',
      severity: 'high',
      userMessage: 'Database operation failed',
      technicalMessage: error.message,
      suggestions: [
        'Try the operation again',
        'Check your internet connection',
        'Contact support if the issue continues'
      ],
      retryable: true
    };
  }
  
  // Export/Import errors
  if (message.includes('export') || message.includes('import') || message.includes('download')) {
    return {
      category: 'export',
      severity: 'medium',
      userMessage: 'Data operation failed',
      technicalMessage: error.message,
      suggestions: [
        'Try the operation again',
        'Check if you have sufficient storage space',
        'Ensure your browser allows downloads'
      ],
      retryable: true
    };
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      category: 'validation',
      severity: 'low',
      userMessage: 'Invalid input detected',
      technicalMessage: error.message,
      suggestions: [
        'Check your input and try again',
        'Ensure all required fields are filled',
        'Verify the format is correct'
      ],
      retryable: false
    };
  }
  
  // Default case
  return {
    category: 'unknown',
    severity: 'medium',
    userMessage: 'An unexpected error occurred',
    technicalMessage: error.message,
    suggestions: [
      'Try refreshing the page',
      'Try the operation again',
      'Contact support if the issue persists'
    ],
    retryable: true
  };
}

// Enhanced error handler with toast notifications
export function handleError(
  error: Error | EnhancedError,
  options: {
    showToast?: boolean;
    debugMode?: boolean;
    context?: string;
    onRetry?: () => void;
  } = {}
) {
  const { showToast = true, debugMode = false, context, onRetry } = options;
  
  // Log error for debugging
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  // Analyze the error
  const analysis = analyzeError(error);
  
  // Show toast notification if requested
  if (showToast) {
    const toastConfig = {
      title: analysis.userMessage,
      description: debugMode 
        ? analysis.technicalMessage 
        : analysis.suggestions[0] || 'Please try again',
      variant: analysis.severity === 'critical' || analysis.severity === 'high' 
        ? 'destructive' as const
        : 'default' as const,
      duration: analysis.severity === 'critical' ? 10000 : 5000,
    };
    
    toast(toastConfig);
  }
  
  return analysis;
}

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    context?: string;
    showToast?: boolean;
    debugMode?: boolean;
    fallback?: T;
    onError?: (error: Error, analysis: ErrorAnalysis) => void;
  } = {}
): Promise<T | null> {
  const { context, showToast = true, debugMode = false, fallback, onError } = options;
  
  try {
    return await operation();
  } catch (error) {
    const enhancedError = error instanceof Error ? error : new Error(String(error));
    const analysis = handleError(enhancedError, { showToast, debugMode, context });
    
    // Call custom error handler if provided
    if (onError) {
      onError(enhancedError, analysis);
    }
    
    // Return fallback value if provided
    if (fallback !== undefined) {
      return fallback;
    }
    
    return null;
  }
}

// Retry mechanism for retryable errors
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    context?: string;
    showToast?: boolean;
    debugMode?: boolean;
  } = {}
): Promise<T | null> {
  const { maxRetries = 3, delay = 1000, context, showToast = true, debugMode = false } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const analysis = analyzeError(lastError);
      
      // Don't retry if error is not retryable
      if (!analysis.retryable) {
        handleError(lastError, { showToast, debugMode, context });
        return null;
      }
      
      // If this is the last attempt, handle the error
      if (attempt === maxRetries) {
        handleError(lastError, { showToast, debugMode, context });
        return null;
      }
      
      // Wait before retrying
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  return null;
}

// Error boundary helper
export function createErrorBoundaryHandler(context: string) {
  return (error: Error, errorInfo: { componentStack: string }) => {
    console.error(`Error boundary caught error in ${context}:`, error, errorInfo);
    
    // You could send this to an error reporting service here
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    handleError(error, {
      context,
      showToast: true,
      debugMode: process.env.NODE_ENV === 'development'
    });
  };
}
'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  handleError, 
  withErrorHandling, 
  withRetry, 
  analyzeError, 
  createEnhancedError,
  type ErrorAnalysis,
  type ErrorCategory,
  type ErrorSeverity 
} from '@/lib/errorHandler';

export interface UseErrorHandlerOptions {
  debugMode?: boolean;
  showToast?: boolean;
  context?: string;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const { debugMode = false, showToast = true, context = 'unknown' } = options;

  // Handle a single error
  const handleSingleError = useCallback((
    error: Error,
    customOptions?: Partial<UseErrorHandlerOptions>
  ): ErrorAnalysis => {
    const mergedOptions = { debugMode, showToast, context, ...customOptions };
    return handleError(error, mergedOptions);
  }, [debugMode, showToast, context]);

  // Create enhanced error
  const createError = useCallback((
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = 'medium',
    options?: {
      code?: string;
      retryable?: boolean;
      userMessage?: string;
      suggestions?: string[];
    }
  ) => {
    return createEnhancedError(message, {
      category,
      severity,
      ...options
    });
  }, []);

  // Wrap async operations with error handling
  const withErrorHandlingWrapper = useCallback(<T>(
    operation: () => Promise<T>,
    customOptions?: {
      fallback?: T;
      onError?: (error: Error, analysis: ErrorAnalysis) => void;
    }
  ) => {
    return withErrorHandling(operation, {
      context,
      showToast,
      debugMode,
      ...customOptions
    });
  }, [context, showToast, debugMode]);

  // Wrap operations with retry logic
  const withRetryWrapper = useCallback(<T>(
    operation: () => Promise<T>,
    customOptions?: {
      maxRetries?: number;
      delay?: number;
    }
  ) => {
    return withRetry(operation, {
      context,
      showToast,
      debugMode,
      ...customOptions
    });
  }, [context, showToast, debugMode]);

  // Show error toast manually
  const showErrorToast = useCallback((
    error: Error,
    customMessage?: string
  ) => {
    const analysis = analyzeError(error);
    
    toast({
      title: customMessage || analysis.userMessage,
      description: analysis.suggestions[0] || 'Please try again',
      variant: analysis.severity === 'critical' || analysis.severity === 'high' 
        ? 'destructive' 
        : 'default',
      duration: analysis.severity === 'critical' ? 10000 : 5000,
    });
  }, [toast]);

  // Show success toast
  const showSuccessToast = useCallback((
    title: string,
    description?: string
  ) => {
    toast({
      title,
      description,
      duration: 5000,
    });
  }, [toast]);

  // Show warning toast
  const showWarningToast = useCallback((
    title: string,
    description?: string
  ) => {
    toast({
      title,
      description,
      variant: 'default',
      duration: 7000,
    });
  }, [toast]);

  return {
    handleError: handleSingleError,
    createError,
    withErrorHandling: withErrorHandlingWrapper,
    withRetry: withRetryWrapper,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    analyzeError
  };
}
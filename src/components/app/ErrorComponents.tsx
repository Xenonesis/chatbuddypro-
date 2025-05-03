'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import React, { useState, useEffect } from 'react';

// Simple loading indicator component
export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Error fallback component
export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const [isHydrationError, setIsHydrationError] = useState(false);
  
  useEffect(() => {
    // Check if this is a hydration error
    if (
      error.message.includes('Hydration failed') ||
      error.message.includes('Text content did not match') ||
      error.message.includes('Expected server HTML to contain')
    ) {
      setIsHydrationError(true);
      // Auto-retry for hydration errors after a short delay
      const timer = setTimeout(() => {
        resetErrorBoundary();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [error, resetErrorBoundary]);
  
  // For hydration errors, show a less alarming message
  if (isHydrationError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Synchronizing display...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center min-h-[300px]">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">We're sorry, but there was an error loading this page.</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-red-500 mb-4 max-w-md overflow-auto p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
          {error.message}
        </pre>
      )}
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Custom error boundary component
export function ErrorBoundary({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ReactErrorBoundary 
      FallbackComponent={fallback ? 
        () => <>{fallback}</> : 
        ErrorFallback
      }
      onReset={() => {
        // Reset the state of your app here
        // For hydration errors, we don't want to do a full reload
        // as it might cause an infinite loop
        if (!window.location.hash.includes('#hydration-retry')) {
          window.location.hash = '#hydration-retry';
          // Soft reset - just force a re-render
        } else {
          // Hard reset if soft reset didn't work
          window.location.reload();
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
} 
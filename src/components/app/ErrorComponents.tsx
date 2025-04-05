'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react';

// Simple loading indicator component
export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Error fallback component
export function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center min-h-[300px]">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">We're sorry, but there was an error loading this page.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Custom error boundary component
export function ErrorBoundary({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) {
  return (
    <ReactErrorBoundary fallback={fallback}>
      {children}
    </ReactErrorBoundary>
  );
} 
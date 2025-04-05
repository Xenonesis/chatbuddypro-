"use client";

import { useEnhancedUI } from '@/lib/utils';
import React, { createContext, useContext } from 'react';

// Create a context for enhanced UI features
export const EnhancedUIContext = createContext<ReturnType<typeof useEnhancedUI> | null>(null);

// Provider component for enhanced UI features
export function EnhancedUIProvider({ children }: { children: React.ReactNode }) {
  const enhancedUI = useEnhancedUI();
  
  return (
    <EnhancedUIContext.Provider value={enhancedUI}>
      {children}
    </EnhancedUIContext.Provider>
  );
}

// Hook to access enhanced UI features
export function useUI() {
  const context = useContext(EnhancedUIContext);
  if (!context) {
    throw new Error('useUI must be used within an EnhancedUIProvider');
  }
  return context;
} 
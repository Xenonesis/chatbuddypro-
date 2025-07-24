'use client';

import { useEffect } from 'react';

export function AppInitializer() {
  useEffect(() => {
    // Minimal initialization to avoid React errors
    console.log('App initialized - migrations disabled');
    
    // Only add the JS class, skip error handling override
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('js-ready');
    }
  }, []);
  
  return null;
} 
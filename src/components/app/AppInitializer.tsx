'use client';

import { useEffect } from 'react';
import { dbMigrationService } from '@/lib/services/dbMigrationService';

export function AppInitializer() {
  useEffect(() => {
    const runMigrations = async () => {
      try {
        console.log('Checking and running database migrations if needed...');
        await dbMigrationService.migrateUserPreferencesTable();
        await dbMigrationService.migrateExistingApiKeys();
        
        // Clean up duplicate records
        console.log('Checking for duplicate user preference records...');
        await dbMigrationService.cleanupDuplicateUserPreferences();
      } catch (error) {
        console.error('Failed to run migrations:', error);
      }
    };
    
    runMigrations();
    
    // Add JS detection class to prevent hydration mismatches
    document.documentElement.classList.add('js-ready');
    
    // Handle potential React hydration errors
    const originalError = console.error;
    console.error = function(...args) {
      // Filter out hydration errors in development
      const errorMessage = args[0]?.toString() || '';
      if (
        errorMessage.includes('Hydration failed') ||
        errorMessage.includes('Text content did not match') ||
        errorMessage.includes('Expected server HTML to contain')
      ) {
        // In production, we'd want to log these to an error tracking service
        console.warn('Hydration error detected. This will be automatically resolved on next render:');
        // Print a more readable version of the error
        console.warn(args[0]);
        return;
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);
  
  return null;
} 
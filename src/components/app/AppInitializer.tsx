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
  }, []);
  
  return null;
} 
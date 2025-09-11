'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pwaService } from '@/lib/services/pwaService';

export function PWAInitializer() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize PWA features when component mounts
    const initializePWA = async () => {
      try {
        if (typeof window !== 'undefined' && !isInitialized) {
          console.log('Initializing PWA features...');
          await pwaService.initialize();
          setIsInitialized(true);
          console.log('PWA features initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize PWA features:', error);
      }
    };

    initializePWA();
  }, [isInitialized]);

  // Handle user authentication changes
  useEffect(() => {
    if (user && isInitialized) {
      // User logged in - setup push notifications
      setupUserNotifications();
    } else if (!user && isInitialized) {
      // User logged out - cleanup notifications
      cleanupUserNotifications();
    }
  }, [user, isInitialized]);

  const setupUserNotifications = async () => {
    try {
      // Check if notifications are supported and get permission
      const permission = await pwaService.requestNotificationPermission();
      
      if (permission === 'granted') {
        // Setup push notifications for authenticated user
        await pwaService.setupPushNotifications();
        console.log('Push notifications setup completed for user');
      } else {
        console.log('Notification permission not granted');
      }
    } catch (error) {
      console.error('Failed to setup user notifications:', error);
    }
  };

  const cleanupUserNotifications = async () => {
    try {
      // Unsubscribe from push notifications when user logs out
      await pwaService.unsubscribeFromPush();
      console.log('Push notifications cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup user notifications:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}
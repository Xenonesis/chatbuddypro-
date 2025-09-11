// PWA Service for managing service worker and push notifications
import { supabase } from '@/lib/supabase';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PWAService {
  private registration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  // Initialize PWA features
  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      console.warn('PWA features not supported in this browser');
      return;
    }

    try {
      await this.registerServiceWorker();
      await this.setupPushNotifications();
      this.setupInstallPrompt();
      this.setupUpdateHandler();
    } catch (error) {
      console.error('Failed to initialize PWA:', error);
    }
  }

  // Check if PWA features are supported
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Register service worker
  async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              this.notifyUpdate();
            }
          });
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Setup push notifications
  async setupPushNotifications(): Promise<void> {
    if (!this.registration) {
      console.warn('Service Worker not registered, skipping push notifications setup');
      return;
    }

    try {
      // Wait for service worker to be active
      await this.waitForServiceWorkerActive();

      // Check if notifications are supported and get permission
      const permission = await this.requestNotificationPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      // Get existing subscription or create new one
      this.pushSubscription = await this.registration.pushManager.getSubscription();
      
      if (!this.pushSubscription) {
        await this.subscribeToPush();
      } else {
        // Update existing subscription in database
        await this.savePushSubscription(this.pushSubscription);
      }

    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  // Wait for service worker to be active
  private async waitForServiceWorkerActive(): Promise<void> {
    if (!this.registration) {
      throw new Error('No service worker registration');
    }

    // If already active, return immediately
    if (this.registration.active) {
      return;
    }

    // Wait for installing service worker to become active
    if (this.registration.installing) {
      await new Promise<void>((resolve) => {
        const worker = this.registration!.installing!;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'activated') {
            resolve();
          }
        });
      });
    } else if (this.registration.waiting) {
      // Service worker is waiting, activate it
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve();
        }, { once: true });
      });
    }

    // Add a small delay to ensure service worker is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    if (!this.registration.active) {
      throw new Error('Service Worker not active');
    }

    try {
      // Generate VAPID keys on the server or use environment variables
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured, skipping push subscription');
        return;
      }

      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        this.pushSubscription = existingSubscription;
        await this.savePushSubscription(existingSubscription);
        return;
      }

      this.pushSubscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Push subscription created:', this.pushSubscription);
      
      // Save subscription to database
      await this.savePushSubscription(this.pushSubscription);

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Save push subscription to database
  async savePushSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated, cannot save push subscription');
        return;
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_data: subscriptionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Failed to save push subscription:', error);
      } else {
        console.log('Push subscription saved successfully');
      }

    } catch (error) {
      console.error('Error saving push subscription:', error);
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<void> {
    try {
      if (this.pushSubscription) {
        await this.pushSubscription.unsubscribe();
        this.pushSubscription = null;
      }

      // Remove from database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);
      }

      console.log('Unsubscribed from push notifications');

    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
    }
  }

  // Show local notification
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag: payload.tag || 'chatbuddy-notification',
      requireInteraction: payload.requireInteraction || false,
      actions: payload.actions || [],
      data: {
        url: payload.url || '/chat',
        timestamp: Date.now(),
        ...payload.data
      },
      vibrate: [200, 100, 200]
    };

    await this.registration.showNotification(payload.title, options);
  }

  // Setup install prompt
  private setupInstallPrompt(): void {
    let deferredPrompt: any = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show custom install button
      this.showInstallButton(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
      this.hideInstallButton();
    });
  }

  // Show install button
  private showInstallButton(deferredPrompt: any): void {
    // Create and show install button
    const installButton = document.createElement('button');
    installButton.textContent = 'Install ChatBuddy';
    installButton.className = 'pwa-install-button';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6, #4f46e5);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: all 0.3s ease;
    `;

    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        deferredPrompt = null;
        this.hideInstallButton();
      }
    });

    document.body.appendChild(installButton);
  }

  // Hide install button
  private hideInstallButton(): void {
    const installButton = document.querySelector('.pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  // Setup update handler
  private setupUpdateHandler(): void {
    if (!this.registration) return;

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
        this.showUpdateNotification();
      }
    });
  }

  // Notify about service worker update
  private notifyUpdate(): void {
    // Show update notification
    this.showUpdateNotification();
  }

  // Show update notification
  private showUpdateNotification(): void {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #3b82f6, #4f46e5);
        color: white;
        padding: 12px 20px;
        text-align: center;
        z-index: 1001;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      ">
        <span>A new version of ChatBuddy is available!</span>
        <button onclick="this.parentElement.parentElement.updateApp()" style="
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 6px 16px;
          border-radius: 4px;
          margin-left: 12px;
          cursor: pointer;
        ">Update Now</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          border: none;
          color: white;
          padding: 6px 12px;
          margin-left: 8px;
          cursor: pointer;
        ">×</button>
      </div>
    `;

    (updateBanner as any).updateApp = () => {
      if (this.registration?.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    };

    document.body.appendChild(updateBanner);
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Get current subscription status
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    permission: NotificationPermission;
    subscription: PushSubscription | null;
  }> {
    const permission = Notification.permission;
    let subscription = null;
    let isSubscribed = false;

    if (this.registration) {
      subscription = await this.registration.pushManager.getSubscription();
      isSubscribed = !!subscription;
    }

    return {
      isSubscribed,
      permission,
      subscription
    };
  }
}

export const pwaService = new PWAService();
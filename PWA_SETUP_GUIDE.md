# PWA & Push Notifications Setup Guide

This guide explains how to set up and use the Progressive Web App (PWA) features and real push notifications in ChatBuddy.

## 🚀 Quick Setup

Run the automated setup script:

```bash
npm run setup-pwa
```

This will:
- Install required dependencies (`web-push`, `@radix-ui/react-scroll-area`)
- Generate VAPID keys for push notifications
- Check your Supabase configuration
- Guide you through the database migration

## 📋 Manual Setup Steps

### 1. Install Dependencies

```bash
npm install web-push @types/web-push @radix-ui/react-scroll-area
```

### 2. Generate VAPID Keys

```bash
npm run generate-vapid
```

Add the generated keys to your `.env.local`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. Database Migration

Run the SQL migration in your Supabase dashboard:

```sql
-- Copy contents from db/migrations/004_add_push_notifications.sql
-- This creates tables for:
-- - push_subscriptions
-- - notification_preferences  
-- - notifications
-- - pwa_installations
```

### 4. Configure Environment Variables

Ensure your `.env.local` has:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PWA Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# Site URL (for production)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🔧 Features Implemented

### ✅ Progressive Web App (PWA)
- **Service Worker**: Caches resources for offline access (`/public/sw.js`)
- **Web App Manifest**: Enhanced with shortcuts, screenshots, and share targets
- **Install Prompt**: Automatic install button for supported browsers
- **Offline Support**: Basic offline functionality with cached resources
- **App Shortcuts**: Quick access to Chat, Dashboard, and Settings

### ✅ Real Push Notifications
- **Push Subscription Management**: Automatic subscription handling
- **Real-time Notifications**: Database-driven notification system
- **Notification Preferences**: Granular user controls
- **Quiet Hours**: Configurable do-not-disturb periods
- **Categories**: Chat, System, Security, and Marketing notifications
- **Actions**: Interactive notification buttons (Open, Dismiss)

### ✅ Notification Management
- **Real Notifications Component**: Replaces demo notifications in navbar
- **Notification History**: View and manage past notifications
- **Mark as Read/Unread**: Individual and bulk actions
- **Delete Notifications**: Remove unwanted notifications
- **Real-time Updates**: Live notification updates via Supabase realtime

### ✅ Settings Interface
- **Notification Settings Page**: Complete preference management
- **Push Toggle**: Enable/disable push notifications
- **Category Controls**: Fine-grained notification type controls
- **Quiet Hours**: Set custom do-not-disturb times
- **Timezone Support**: Respect user's timezone for quiet hours
- **Test Notifications**: Send test notifications to verify setup

## 📱 How It Works

### Service Worker Registration
The PWA service automatically registers the service worker and handles:
- Resource caching for offline access
- Push notification handling
- Background sync for offline messages
- App update notifications

### Push Notification Flow
1. User grants notification permission
2. Browser creates push subscription
3. Subscription saved to database
4. Server sends notifications via Web Push API
5. Service worker displays notifications
6. User interactions tracked and handled

### Notification Preferences
Users can control:
- **Push Notifications**: Enable/disable browser notifications
- **Email Notifications**: Enable/disable email alerts
- **Categories**: Chat messages, system updates, security alerts, marketing
- **Quiet Hours**: Set times to suppress non-critical notifications
- **Timezone**: Respect user's local timezone

## 🔒 Security & Privacy

### VAPID Keys
- **Public Key**: Safe to expose in client-side code
- **Private Key**: Keep secure, never expose publicly
- **Unique per App**: Same keys across all environments for consistency

### User Permissions
- **Explicit Consent**: Users must grant notification permission
- **Granular Controls**: Fine-grained preference management
- **Easy Opt-out**: Simple unsubscribe process
- **Data Privacy**: Minimal data collection, user-controlled

## 🚀 Deployment Considerations

### HTTPS Required
Push notifications require HTTPS in production. Ensure your deployment uses SSL.

### Environment Variables
Set these in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Other platforms: Check their documentation

### Database Setup
Ensure the migration is run in your production Supabase instance.

## 🧪 Testing

### Local Development
1. Run `npm run dev`
2. Open browser developer tools
3. Check Application → Service Workers
4. Test notification permission and functionality

### Production Testing
1. Deploy to HTTPS environment
2. Test PWA installation
3. Verify push notifications work
4. Test offline functionality

## 📊 Monitoring

### Service Worker Status
Check in browser dev tools:
- Application → Service Workers
- Console for service worker logs
- Network tab for cached requests

### Notification Delivery
Monitor in your app:
- Notification settings page shows subscription status
- Database tables track delivery status
- Console logs show push notification events

## 🔧 API Endpoints

### Push Notifications
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `DELETE /api/notifications/subscribe` - Unsubscribe from push notifications
- `POST /api/notifications/send` - Send notification (admin/system)

### Preferences
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update user preferences

## 🎯 Usage Examples

### Send a Notification (Server-side)
```javascript
await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetUserId: 'user-uuid',
    title: 'New Message',
    message: 'You have a new chat message',
    category: 'chat',
    data: { chatId: 'chat-123' }
  })
});
```

### Show Local Notification
```javascript
import { pwaService } from '@/lib/services/pwaService';

await pwaService.showNotification({
  title: 'Local Notification',
  body: 'This is a local notification',
  url: '/chat'
});
```

### Check Subscription Status
```javascript
const status = await pwaService.getSubscriptionStatus();
console.log('Subscribed:', status.isSubscribed);
console.log('Permission:', status.permission);
```

## 🐛 Troubleshooting

### Common Issues

**Push notifications not working:**
- Check HTTPS is enabled
- Verify VAPID keys are correct
- Ensure user granted permission
- Check browser compatibility

**Service worker not registering:**
- Check `/public/sw.js` exists
- Verify no JavaScript errors
- Check browser dev tools console

**Offline functionality not working:**
- Verify service worker is active
- Check cache storage in dev tools
- Ensure resources are being cached

**Database errors:**
- Run the migration script
- Check Supabase connection
- Verify RLS policies are correct

### Browser Support
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Limited push notification support
- **Mobile browsers**: Generally good support

## 📚 File Structure

```
├── public/
│   ├── sw.js                          # Service worker
│   └── manifest.json                  # PWA manifest
├── src/
│   ├── components/
│   │   ├── app/PWAInitializer.tsx     # PWA initialization
│   │   ├── settings/NotificationSettings.tsx  # Settings UI
│   │   └── ui-custom/RealNotifications.tsx    # Notifications component
│   ├── lib/services/
│   │   ├── pwaService.ts              # PWA management
│   │   └── notificationService.ts     # Notification management
│   └── app/api/notifications/         # API routes
├── db/migrations/
│   └── 004_add_push_notifications.sql # Database schema
└── scripts/
    ├── setup-pwa.js                   # Setup automation
    └── generate-vapid-keys.js         # VAPID key generation
```

## 🎉 Success!

Your ChatBuddy app now has:
- ✅ Full PWA capabilities with offline support
- ✅ Real push notifications with user preferences
- ✅ Professional notification management UI
- ✅ Secure and privacy-focused implementation
- ✅ Easy setup and deployment process

Users can now install ChatBuddy as a native app and receive real-time notifications for chat messages and system updates!
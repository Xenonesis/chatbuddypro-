#!/usr/bin/env node

/**
 * Generate VAPID keys for push notifications
 * Run with: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

console.log('Generating VAPID keys for push notifications...\n');

try {
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('✅ VAPID keys generated successfully!\n');
  console.log('Add these to your .env file:\n');
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`);
  
  console.log('⚠️  Important:');
  console.log('- Keep the private key secure and never expose it publicly');
  console.log('- The public key can be safely used in client-side code');
  console.log('- These keys should be the same across all environments for the same app');
  console.log('- If you change these keys, existing push subscriptions will become invalid\n');
  
} catch (error) {
  console.error('❌ Error generating VAPID keys:', error);
  process.exit(1);
}
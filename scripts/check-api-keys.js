#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function checkEnvironmentKeys() {
  console.log('\n🔍 Checking environment variables for API keys...');
  
  const envKeys = {
    'NEXT_PUBLIC_OPENAI_API_KEY': process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    'NEXT_PUBLIC_GEMINI_API_KEY': process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    'NEXT_PUBLIC_MISTRAL_API_KEY': process.env.NEXT_PUBLIC_MISTRAL_API_KEY,
    'NEXT_PUBLIC_CLAUDE_API_KEY': process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    'NEXT_PUBLIC_LLAMA_API_KEY': process.env.NEXT_PUBLIC_LLAMA_API_KEY,
    'NEXT_PUBLIC_DEEPSEEK_API_KEY': process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
  };
  
  let hasAnyKey = false;
  
  for (const [keyName, keyValue] of Object.entries(envKeys)) {
    if (keyValue) {
      console.log(`   ✅ ${keyName}: ${keyValue.substring(0, 8)}...`);
      hasAnyKey = true;
    } else {
      console.log(`   ❌ ${keyName}: Not set`);
    }
  }
  
  if (!hasAnyKey) {
    console.log('\n⚠️  No API keys found in environment variables!');
  }
  
  return hasAnyKey;
}

async function checkUserPreferences() {
  console.log('\n🔍 Checking user preferences for API keys...');
  
  try {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('api_keys, ai_providers')
      .limit(5);
    
    if (error) {
      console.log(`   ❌ Error fetching user preferences: ${error.message}`);
      return false;
    }
    
    if (!preferences || preferences.length === 0) {
      console.log('   ⚠️  No user preferences found');
      return false;
    }
    
    console.log(`   📊 Found ${preferences.length} user preference records`);
    
    let hasApiKeys = false;
    
    preferences.forEach((pref, index) => {
      console.log(`\n   User ${index + 1}:`);
      
      if (pref.api_keys && typeof pref.api_keys === 'object') {
        const keys = Object.keys(pref.api_keys);
        if (keys.length > 0) {
          console.log(`     API Keys: ${keys.join(', ')}`);
          hasApiKeys = true;
        } else {
          console.log('     API Keys: None');
        }
      } else {
        console.log('     API Keys: None');
      }
      
      if (pref.ai_providers && typeof pref.ai_providers === 'object') {
        const providers = Object.keys(pref.ai_providers);
        console.log(`     AI Providers: ${providers.join(', ')}`);
      }
    });
    
    return hasApiKeys;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testMistralApiKey() {
  console.log('\n🧪 Testing Mistral API key...');
  
  // Check for Mistral API key in environment
  const envKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
  
  if (!envKey) {
    console.log('   ❌ No Mistral API key found in environment variables');
    return false;
  }
  
  console.log(`   🔑 Found Mistral API key: ${envKey.substring(0, 8)}...`);
  
  try {
    // Test the API key with a simple request
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${envKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Mistral API key is valid');
      console.log(`   📋 Available models: ${data.data?.length || 0}`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Mistral API key test failed: ${response.status} - ${errorText}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error testing Mistral API key: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔑 ChatBuddy Pro - API Key Checker');
  console.log('==================================');
  
  const hasEnvKeys = await checkEnvironmentKeys();
  const hasUserKeys = await checkUserPreferences();
  await testMistralApiKey();
  
  console.log('\n📋 Summary:');
  console.log(`   Environment API Keys: ${hasEnvKeys ? '✅ Found' : '❌ None'}`);
  console.log(`   User Preference Keys: ${hasUserKeys ? '✅ Found' : '❌ None'}`);
  
  if (!hasEnvKeys && !hasUserKeys) {
    console.log('\n⚠️  ISSUE IDENTIFIED: No API keys configured!');
    console.log('\n🔧 To fix the Mistral API error:');
    console.log('1. Get a Mistral API key from: https://console.mistral.ai/');
    console.log('2. Add it to your .env.local file:');
    console.log('   NEXT_PUBLIC_MISTRAL_API_KEY=your_mistral_api_key_here');
    console.log('3. Or add it through the Settings page in your app');
    console.log('4. Restart your development server');
  }
}

main().catch(console.error);

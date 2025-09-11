#!/usr/bin/env node

/**
 * Vercel Setup Script
 * Helps configure environment variables and deployment settings for Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ChatBuddy Vercel Setup');
console.log('========================\n');

// Check if vercel.json exists
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  console.log('✅ vercel.json configuration found');
} else {
  console.log('❌ vercel.json not found - this should be included in the project');
}

// Check if .env.example exists
const envExamplePath = path.join(process.cwd(), '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example template found');
} else {
  console.log('❌ .env.example not found');
}

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local found');
  
  // Check for required environment variables
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  console.log('\n📋 Environment Variables Check:');
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=your_`)) {
      console.log(`✅ ${varName} - configured`);
    } else {
      console.log(`❌ ${varName} - missing or not configured`);
    }
  });
} else {
  console.log('⚠️  .env.local not found');
  console.log('   Copy .env.example to .env.local and configure your variables');
}

console.log('\n🔧 Vercel Deployment Steps:');
console.log('1. Install Vercel CLI: npm i -g vercel');
console.log('2. Login to Vercel: vercel login');
console.log('3. Deploy preview: npm run deploy:vercel-preview');
console.log('4. Deploy production: npm run deploy:vercel');

console.log('\n📖 For detailed instructions, see:');
console.log('   - VERCEL_DEPLOYMENT.md');
console.log('   - docs/DEPLOYMENT_GUIDE.md');

console.log('\n🌐 Environment Variables for Vercel Dashboard:');
console.log('   Go to: Settings → Environment Variables');
console.log('   Add the same variables from your .env.local file');

console.log('\n✨ Quick Deploy Button:');
console.log('   Use the "Deploy with Vercel" button in VERCEL_DEPLOYMENT.md');
console.log('   for one-click deployment with environment variable prompts');

console.log('\n🎉 Setup complete! Ready for Vercel deployment.');
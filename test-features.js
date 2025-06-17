// ChatBuddy Feature Test Script
// This script tests the key features of the ChatBuddy application

const fs = require('fs');
const path = require('path');

// Features to test
const features = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Login, signup, and password reset functionality',
    subFeatures: [
      { id: 'login', name: 'Login', status: 'untested' },
      { id: 'signup', name: 'Signup', status: 'untested' },
      { id: 'reset', name: 'Password Reset', status: 'untested' },
      { id: 'signout', name: 'Sign Out', status: 'untested' }
    ]
  },
  {
    id: 'chat',
    name: 'Chat Interface',
    description: 'Core chat functionality',
    subFeatures: [
      { id: 'send', name: 'Send Message', status: 'untested' },
      { id: 'receive', name: 'Receive Response', status: 'untested' },
      { id: 'history', name: 'Chat History', status: 'untested' },
      { id: 'regenerate', name: 'Regenerate Response', status: 'untested' }
    ]
  },
  {
    id: 'ai-models',
    name: 'AI Models',
    description: 'Integration with different AI providers',
    subFeatures: [
      { id: 'openai', name: 'OpenAI', status: 'untested' },
      { id: 'gemini', name: 'Google Gemini', status: 'untested' },
      { id: 'mistral', name: 'Mistral', status: 'untested' },
      { id: 'claude', name: 'Claude', status: 'untested' },
      { id: 'llama', name: 'Llama', status: 'untested' },
      { id: 'deepseek', name: 'DeepSeek', status: 'untested' }
    ]
  },
  {
    id: 'chat-modes',
    name: 'Chat Modes',
    description: 'Different modes for AI responses',
    subFeatures: [
      { id: 'thoughtful', name: 'Thoughtful Mode', status: 'untested' },
      { id: 'quick', name: 'Quick Mode', status: 'untested' },
      { id: 'creative', name: 'Creative Mode', status: 'untested' },
      { id: 'technical', name: 'Technical Mode', status: 'untested' },
      { id: 'learning', name: 'Learning Mode', status: 'untested' }
    ]
  },
  {
    id: 'voice',
    name: 'Voice Input',
    description: 'Speech-to-text functionality',
    subFeatures: [
      { id: 'recognition', name: 'Speech Recognition', status: 'untested' },
      { id: 'continuous', name: 'Continuous Listening', status: 'untested' },
      { id: 'language', name: 'Language Selection', status: 'untested' }
    ]
  },
  {
    id: 'suggestions',
    name: 'Smart Suggestions',
    description: 'Follow-up suggestions and recommendations',
    subFeatures: [
      { id: 'follow-up', name: 'Follow-up Questions', status: 'untested' },
      { id: 'topics', name: 'Topic Suggestions', status: 'untested' },
      { id: 'prompts', name: 'Prompt Recommendations', status: 'untested' },
      { id: 'favorites', name: 'Favorite Prompts', status: 'untested' }
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'User preferences and configuration',
    subFeatures: [
      { id: 'api-keys', name: 'API Key Management', status: 'untested' },
      { id: 'preferences', name: 'User Preferences', status: 'untested' },
      { id: 'theme', name: 'Theme Toggling', status: 'untested' },
      { id: 'reset', name: 'Reset Settings', status: 'untested' }
    ]
  },
  {
    id: 'ui',
    name: 'User Interface',
    description: 'UI components and responsive design',
    subFeatures: [
      { id: 'responsive', name: 'Responsive Design', status: 'untested' },
      { id: 'styling', name: 'Styling and Themes', status: 'untested' },
      { id: 'navigation', name: 'Navigation', status: 'untested' },
      { id: 'accessibility', name: 'Accessibility', status: 'untested' }
    ]
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Supabase integration and data storage',
    subFeatures: [
      { id: 'connection', name: 'Database Connection', status: 'untested' },
      { id: 'storage', name: 'Data Storage', status: 'untested' },
      { id: 'retrieval', name: 'Data Retrieval', status: 'untested' },
      { id: 'sync', name: 'Account Synchronization', status: 'untested' }
    ]
  }
];

function generateTestReport() {
  let report = '# ChatBuddy Feature Test Report\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  report += '## Summary\n\n';
  
  const totalFeatures = features.reduce((acc, feature) => acc + feature.subFeatures.length, 0);
  const testedFeatures = features.reduce((acc, feature) => {
    return acc + feature.subFeatures.filter(sf => sf.status !== 'untested').length;
  }, 0);
  const passedFeatures = features.reduce((acc, feature) => {
    return acc + feature.subFeatures.filter(sf => sf.status === 'passed').length;
  }, 0);
  const failedFeatures = features.reduce((acc, feature) => {
    return acc + feature.subFeatures.filter(sf => sf.status === 'failed').length;
  }, 0);
  
  report += `- Total Features: ${totalFeatures}\n`;
  report += `- Tested: ${testedFeatures} (${Math.round(testedFeatures/totalFeatures*100)}%)\n`;
  report += `- Passed: ${passedFeatures} (${Math.round(passedFeatures/totalFeatures*100)}%)\n`;
  report += `- Failed: ${failedFeatures} (${Math.round(failedFeatures/totalFeatures*100)}%)\n\n`;
  
  report += '## Feature Details\n\n';
  
  features.forEach(feature => {
    report += `### ${feature.name}\n`;
    report += `${feature.description}\n\n`;
    
    report += '| Subfeature | Status | Notes |\n';
    report += '|------------|--------|-------|\n';
    
    feature.subFeatures.forEach(subFeature => {
      let statusEmoji = '❓';
      if (subFeature.status === 'passed') statusEmoji = '✅';
      if (subFeature.status === 'failed') statusEmoji = '❌';
      if (subFeature.status === 'partial') statusEmoji = '⚠️';
      
      report += `| ${subFeature.name} | ${statusEmoji} ${subFeature.status} | ${subFeature.notes || ''} |\n`;
    });
    
    report += '\n';
  });
  
  // Write report to file
  fs.writeFileSync('feature-test-report.md', report);
  console.log('Report generated: feature-test-report.md');
}

// Manual test checklist
function generateManualTestChecklist() {
  let checklist = '# ChatBuddy Manual Test Checklist\n\n';
  
  features.forEach(feature => {
    checklist += `## ${feature.name}\n`;
    checklist += `${feature.description}\n\n`;
    
    feature.subFeatures.forEach(subFeature => {
      checklist += `### ${subFeature.name}\n`;
      checklist += '- [ ] Test steps:\n';
      
      // Generate specific test steps based on feature
      switch(`${feature.id}-${subFeature.id}`) {
        case 'auth-login':
          checklist += '  - [ ] Navigate to /auth/login\n';
          checklist += '  - [ ] Enter valid credentials\n';
          checklist += '  - [ ] Click "Sign in" button\n';
          checklist += '  - [ ] Verify redirect to dashboard\n';
          break;
        case 'auth-signup':
          checklist += '  - [ ] Navigate to /auth/signup\n';
          checklist += '  - [ ] Enter new user information\n';
          checklist += '  - [ ] Click "Create account" button\n';
          checklist += '  - [ ] Verify email verification flow\n';
          break;
        case 'chat-send':
          checklist += '  - [ ] Navigate to /chat\n';
          checklist += '  - [ ] Type a message in the input box\n';
          checklist += '  - [ ] Click the send button\n';
          checklist += '  - [ ] Verify message appears in chat\n';
          break;
        case 'chat-receive':
          checklist += '  - [ ] After sending a message\n';
          checklist += '  - [ ] Verify AI response is received\n';
          checklist += '  - [ ] Verify response formatting is correct\n';
          break;
        case 'ai-models-openai':
          checklist += '  - [ ] Go to Settings\n';
          checklist += '  - [ ] Add OpenAI API key\n';
          checklist += '  - [ ] Select OpenAI provider in chat\n';
          checklist += '  - [ ] Send a message and verify response\n';
          break;
        case 'chat-modes-technical':
          checklist += '  - [ ] Select Technical mode\n';
          checklist += '  - [ ] Ask a technical question\n';
          checklist += '  - [ ] Verify response has technical details/code\n';
          break;
        case 'voice-recognition':
          checklist += '  - [ ] Click the microphone button\n';
          checklist += '  - [ ] Allow microphone permissions\n';
          checklist += '  - [ ] Speak a message\n';
          checklist += '  - [ ] Verify text appears in input\n';
          break;
        case 'suggestions-follow-up':
          checklist += '  - [ ] After receiving an AI response\n';
          checklist += '  - [ ] Verify follow-up suggestions appear\n';
          checklist += '  - [ ] Click a suggestion\n';
          checklist += '  - [ ] Verify it is added to input\n';
          break;
        case 'settings-api-keys':
          checklist += '  - [ ] Go to Settings page\n';
          checklist += '  - [ ] Add/update an API key\n';
          checklist += '  - [ ] Save settings\n';
          checklist += '  - [ ] Refresh and verify key is saved\n';
          break;
        case 'database-connection':
          checklist += '  - [ ] Check dashboard for database status\n';
          checklist += '  - [ ] Verify connection success message\n';
          break;
        default:
          checklist += '  - [ ] Add specific test steps here\n';
      }
      
      checklist += '- [ ] Expected result: \n';
      checklist += '- [ ] Actual result: \n';
      checklist += '- [ ] Status: \n';
      checklist += '\n';
    });
  });
  
  // Write checklist to file
  fs.writeFileSync('manual-test-checklist.md', checklist);
  console.log('Manual test checklist generated: manual-test-checklist.md');
}

// Generate database test script
function generateDatabaseTest() {
  const testScript = `// Database Test Script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseConnection() {
  try {
    // Simple test query to check connection
    const { data, error } = await supabase
      .from('chats')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Database connection successful!');
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Run test
testDatabaseConnection();
`;

  fs.writeFileSync('test-database-connection.js', testScript);
  console.log('Database test script generated: test-database-connection.js');
}

// Generate API test script
function generateApiTest() {
  const testScript = `// API Test Script
const fetch = require('node-fetch');
require('dotenv').config();

// Test OpenAI API
async function testOpenAI() {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OpenAI API key not found in environment variables');
    return false;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, this is a test message. Please respond with "Test successful".' }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ OpenAI API test successful');
      console.log('Response:', data.choices[0].message.content);
      return true;
    } else {
      console.error('❌ OpenAI API test failed:', data.error?.message);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI API test error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Running API tests...');
  await testOpenAI();
}

runTests();
`;

  fs.writeFileSync('test-api-connection.js', testScript);
  console.log('API test script generated: test-api-connection.js');
}

// Run all generators
generateTestReport();
generateManualTestChecklist();
generateDatabaseTest();
generateApiTest();

console.log('All test resources generated successfully!'); 
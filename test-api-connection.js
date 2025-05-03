// API Test Script
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
        'Authorization': `Bearer ${apiKey}`
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

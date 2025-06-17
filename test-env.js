// A simple script to test that environment variables are loading properly
// Run with: node test-env.js

// Load environment variables from .env.local (similar to how Next.js does it)
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variable Test');
console.log('========================');
console.log('OpenAI API Key:', process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 
  `Configured (${process.env.NEXT_PUBLIC_OPENAI_API_KEY.substring(0, 5)}...)` : 
  'Not configured');
  
console.log('Gemini API Key:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 
  `Configured (${process.env.NEXT_PUBLIC_GEMINI_API_KEY.substring(0, 5)}...)` : 
  'Not configured');
  
console.log('Mistral API Key:', process.env.NEXT_PUBLIC_MISTRAL_API_KEY ? 
  `Configured (${process.env.NEXT_PUBLIC_MISTRAL_API_KEY.substring(0, 5)}...)` : 
  'Not configured');
  
console.log('Debug Mode:', process.env.NEXT_PUBLIC_DEBUG || 'false');
console.log('========================');

// Try to make a minimal fetch to the Gemini API endpoint to see if it works
if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  console.log('Testing Gemini API connectivity...');
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "Hello, this is a test message."
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100
    }
  };
  
  // Make asynchronous fetch inside an async IIFE
  (async () => {
    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Gemini API test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Gemini API test response:', data ? 'Valid JSON response' : 'Empty response');
        console.log('Test successful!');
      } else {
        const error = await response.text();
        console.error('Gemini API test error:', error);
      }
    } catch (error) {
      console.error('Gemini API test exception:', error);
    }
  })();
} else {
  console.log('Skipping Gemini API test (no API key configured)');
} 
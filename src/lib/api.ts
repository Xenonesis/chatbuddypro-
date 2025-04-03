// API Keys can be added in the Settings page
// Your keys are stored locally in your browser and never sent to servers

// Updated to use the ModelSettings type from context
import { ModelSettings, AIProvider, ChatMode } from './context/ModelSettingsContext';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Function to get parameters based on chat mode
function getParametersForMode(settings: ModelSettings, provider: AIProvider): {
  temperature: number;
  maxTokens: number;
  systemMessage?: string;
} {
  const mode = settings.chatMode;
  const baseSettings = settings[provider];
  let temperature = baseSettings.temperature;
  let maxTokens = baseSettings.maxTokens;
  let systemMessage: string | undefined;

  switch (mode) {
    case 'thoughtful':
      temperature = 0.5; // Lower temperature for more deterministic responses
      maxTokens = 800; // More tokens for detailed answers
      systemMessage = "You are a thoughtful assistant that provides detailed, well-considered responses. Take your time to analyze questions deeply before answering.";
      break;
    case 'quick':
      temperature = 0.7; // Default temperature
      maxTokens = 300; // Fewer tokens for shorter responses
      systemMessage = "You are a concise assistant that provides brief, to-the-point responses. Keep your answers short and direct.";
      break;
    case 'creative':
      temperature = 0.9; // Higher temperature for more creative responses
      maxTokens = 800; // More tokens for creative content
      systemMessage = "You are a creative assistant specializing in storytelling, content creation, and imaginative responses. Feel free to be artistic and expressive.";
      break;
    case 'technical':
      temperature = 0.3; // Lower temperature for more precise responses
      maxTokens = 800; // More tokens for technical explanations
      systemMessage = "You are a technical assistant that provides accurate, precise information. Include code examples, technical explanations, and structured data when appropriate.";
      break;
    case 'learning':
      temperature = 0.6; // Moderate temperature
      maxTokens = 1000; // More tokens for educational content
      systemMessage = "You are an educational assistant that breaks down complex topics into simpler concepts. Provide clear explanations with examples and analogies when helpful.";
      break;
  }

  return { temperature, maxTokens, systemMessage };
}

// Add system message if needed
function addSystemMessageIfNeeded(messages: ChatMessage[], systemMessage?: string): ChatMessage[] {
  if (!systemMessage) return [...messages];
  
  // Check if there's already a system message
  const hasSystemMessage = messages.some(msg => msg.role === 'system');
  
  if (hasSystemMessage) {
    // Replace existing system message
    return messages.map(msg => 
      msg.role === 'system' ? { role: 'system', content: systemMessage } : msg
    );
  } else {
    // Add new system message at the beginning
    return [{ role: 'system', content: systemMessage }, ...messages];
  }
}

// OpenAI API
export async function callOpenAI(messages: ChatMessage[], settings?: ModelSettings): Promise<string> {
  let apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  let model = 'gpt-3.5-turbo';
  let temperature = 0.7;
  let maxTokens = 500;
  let finalMessages = [...messages];
  
  // Use settings if provided
  if (settings) {
    apiKey = settings.openai.apiKey || apiKey;
    model = settings.openai.selectedModel;
    
    // Get parameters based on chat mode
    const { temperature: modeTemp, maxTokens: modeMaxTokens, systemMessage } = 
      getParametersForMode(settings, 'openai');
    
    temperature = modeTemp;
    maxTokens = modeMaxTokens;
    
    // Add system message if provided
    if (systemMessage) {
      finalMessages = addSystemMessageIfNeeded(messages, systemMessage);
    }
  }
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to call OpenAI API');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Gemini API
export async function callGemini(prompt: string, settings?: ModelSettings): Promise<string> {
  let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  let model = 'gemini-pro';
  let temperature = 0.7;
  let maxTokens = 500;
  let systemInstruction = '';
  
  // First check if we have a cached successful API version
  let cachedApiVersion = null;
  if (typeof window !== 'undefined') {
    cachedApiVersion = localStorage.getItem('GEMINI_API_VERSION');
  }
  
  // Use settings if provided
  if (settings) {
    apiKey = settings.gemini.apiKey || apiKey;
    model = settings.gemini.selectedModel;
    
    // Get parameters based on chat mode
    const { temperature: modeTemp, maxTokens: modeMaxTokens, systemMessage } = 
      getParametersForMode(settings, 'gemini');
    
    temperature = modeTemp;
    maxTokens = modeMaxTokens;
    
    // For Gemini, we'll prepend the system message to the prompt
    if (systemMessage) {
      systemInstruction = `${systemMessage}\n\nUser query: `;
    }
  }
  
  // Transform model name to API format if needed
  // The model parameter in the URL should be standardized
  const getApiModelName = (modelName: string) => {
    // Map UI friendly names to API model names
    const modelMap: Record<string, string> = {
      'gemini-pro': 'gemini-pro',
      'gemini-pro-vision': 'gemini-pro-vision',
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash', 
      'gemini-2.0-flash': 'gemini-2.0-flash',
      'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
    };
    
    return modelMap[modelName] || modelName;
  };
  
  const apiModelName = getApiModelName(model);
  
  // More robust API key validation - check for proper format
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add it to your .env.local file or settings.');
  }
  
  if (!apiKey.startsWith('AIza')) {
    throw new Error('Invalid Gemini API key format. Gemini API keys should start with "AIza".');
  }
  
  // Maximum retries for API calls
  const MAX_RETRIES = 2;
  let retries = 0;
  
  // First try v1, then fallback to v1beta if needed
  let apiVersions = ['v1', 'v1beta'];
  let currentVersionIndex = 0;
  
  // Retry the API call up to MAX_RETRIES times
  while (retries <= MAX_RETRIES) {
    try {
      console.log(`Calling Gemini API (attempt ${retries + 1}/${MAX_RETRIES + 1})...`);
      
      // Use the current API version from our list
      const apiVersion = cachedApiVersion || apiVersions[currentVersionIndex % apiVersions.length];
      const requestUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${apiModelName}:generateContent?key=${apiKey}`;
      
      console.log(`Using Gemini API version: ${apiVersion}, model: ${apiModelName}`);
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: systemInstruction + prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };
      
      // Set timeout for fetch request (15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        console.log('Gemini API request body:', JSON.stringify(requestBody).substring(0, 100) + '...');
        
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Log the status code for debugging
        console.log(`Gemini API response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Gemini API error text: ${errorText}`);
          
          let errorJson;
          try {
            errorJson = errorText ? JSON.parse(errorText) : { error: { message: 'Empty response' } };
          } catch (e) {
            // If response is not JSON, use the text directly
            console.error(`Gemini API error (${response.status}): ${errorText || response.statusText}`);
            throw new Error(`Gemini API error: ${response.status} - ${errorText || response.statusText}`);
          }
          
          console.error('Gemini API error response:', errorJson);
          
          // Check for specific error types and provide more helpful messages
          if (response.status === 403) {
            throw new Error(`Gemini API key is invalid or has insufficient permissions`);
          } else if (response.status === 404) {
            throw new Error(`Gemini API model not found. This may be due to using an outdated API version or incorrect model name.`);
          } else if (response.status === 429) {
            throw new Error(`Gemini API rate limit exceeded. Please try again later.`);
          } else {
            throw new Error(errorJson.error?.message || `Gemini API error: ${response.status} - ${response.statusText}`);
          }
        }
        
        // Get response as text first to log it
        const responseText = await response.text();
        console.log(`Gemini API response text preview: ${responseText.substring(0, 100)}...`);
        
        // Now parse it as JSON
        const data = responseText ? JSON.parse(responseText) : {};
        
        // Check if the response contains the expected data structure
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
          console.error('Unexpected Gemini API response structure:', data);
          throw new Error('Received unexpected response structure from Gemini API');
        }
        
        // Cache the successful API version for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem('GEMINI_API_VERSION', apiVersion);
        }
        
        return data.candidates[0].content.parts[0].text;
      } catch (fetchError) {
        if (fetchError && typeof fetchError === 'object' && 'name' in fetchError && fetchError.name === 'AbortError') {
          throw new Error('Gemini API request timed out after 15 seconds');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error(`Gemini API error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
      
      // Check for specific API version errors and retry with alternate API version
      if (error instanceof Error && 
          (error.message.includes('not found for API version') || 
           error.message.includes('not supported for generateContent'))) {
        console.log('Detected API version issue, trying different API version...');
        
        // Try the next API version
        currentVersionIndex++;
        
        // If we still have retries left, continue
        if (retries < MAX_RETRIES) {
          retries++;
          // Continue to next iteration without waiting
          continue;
        }
      }
      
      // Check for model-specific errors
      if (error instanceof Error && 
          (error.message.includes('Model not found') || 
           error.message.includes('not available'))) {
        // If using newer models but they aren't available, try falling back to gemini-pro
        if (model !== 'gemini-pro' && model !== 'gemini-pro-vision') {
          console.log(`Model ${model} not found. Falling back to gemini-pro...`);
          model = 'gemini-pro';
          
          // Reset API version to try again with the basic model
          currentVersionIndex = 0;
          
          if (retries < MAX_RETRIES) {
            retries++;
            continue;
          }
        }
      }
      
      // If we've reached max retries, throw the error
      if (retries === MAX_RETRIES) {
        if (error instanceof Error) {
          throw new Error(`Gemini API error: ${error.message}`);
        } else {
          throw new Error('Unknown error occurred while calling Gemini API');
        }
      }
      
      // Wait before retrying (exponential backoff: 1s, then 2s)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      retries++;
    }
  }
  
  // This should not be reached due to the throw in the loop, but TypeScript needs it
  throw new Error('Failed to call Gemini API after maximum retries');
}

// Mistral API
export async function callMistral(messages: ChatMessage[], settings?: ModelSettings): Promise<string> {
  let apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY;
  let model = 'mistral-small';
  let temperature = 0.7;
  let maxTokens = 500;
  let finalMessages = [...messages];
  
  // Use settings if provided
  if (settings) {
    apiKey = settings.mistral.apiKey || apiKey;
    model = settings.mistral.selectedModel;
    
    // Get parameters based on chat mode
    const { temperature: modeTemp, maxTokens: modeMaxTokens, systemMessage } = 
      getParametersForMode(settings, 'mistral');
    
    temperature = modeTemp;
    maxTokens = modeMaxTokens;
    
    // Add system message if provided
    if (systemMessage) {
      finalMessages = addSystemMessageIfNeeded(messages, systemMessage);
    }
  }
  
  if (!apiKey) {
    throw new Error('Mistral API key is not configured');
  }
  
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to call Mistral API');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

// Function to validate API configuration
export function validateApiConfiguration() {
  // Focus on localStorage keys stored by the settings component rather than env vars
  let openaiKey = '';
  let geminiKey = '';
  let mistralKey = '';
  
  // In the browser, check localStorage
  if (typeof window !== 'undefined') {
    openaiKey = localStorage.getItem('NEXT_PUBLIC_OPENAI_API_KEY') || '';
    geminiKey = localStorage.getItem('NEXT_PUBLIC_GEMINI_API_KEY') || '';
    mistralKey = localStorage.getItem('NEXT_PUBLIC_MISTRAL_API_KEY') || '';
  }
  
  const results = {
    openai: {
      configured: Boolean(openaiKey),
      keyPrefix: openaiKey ? openaiKey.substring(0, 3) + '...' : 'not set'
    },
    gemini: {
      configured: Boolean(geminiKey),
      keyPrefix: geminiKey ? geminiKey.substring(0, 4) + '...' : 'not set'
    },
    mistral: {
      configured: Boolean(mistralKey), 
      keyPrefix: mistralKey ? mistralKey.substring(0, 3) + '...' : 'not set'
    },
    anyConfigured: Boolean(openaiKey || geminiKey || mistralKey)
  };
  
  return results;
}

// Unified API function to handle all providers
export async function callAI(messages: ChatMessage[], provider: AIProvider, settings?: ModelSettings): Promise<string> {
  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(messages, settings);
      case 'gemini':
        // Gemini needs a specially formatted conversation history
        // Format: Convert chat messages into a conversation string
        let conversation = '';
        
        // Extract system message if present
        const systemMessage = messages.find(msg => msg.role === 'system');
        const regularMessages = messages.filter(msg => msg.role !== 'system');
        
        // If we have a system message, add it as context at the beginning
        if (systemMessage) {
          conversation += `Context: ${systemMessage.content}\n\n`;
        }
        
        // Add all messages in order
        for (const msg of regularMessages) {
          const role = msg.role === 'assistant' ? 'AI' : 'User';
          conversation += `${role}: ${msg.content}\n\n`;
        }
        
        return await callGemini(conversation, settings);
      case 'mistral':
        return await callMistral(messages, settings);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error);
    throw error;
  }
} 
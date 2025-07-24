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
  let apiKey = '';

  // Priority order: Settings -> Environment variables
  // 1. Use settings if provided (highest priority)
  if (settings && settings.openai) {
    apiKey = settings.openai.apiKey || '';
  }

  // 2. Check environment variables as fallback
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }
  
  let model = 'gpt-3.5-turbo';
  let temperature = 0.7;
  let maxTokens = 500;
  let finalMessages = [...messages];
  
  // Use settings if provided
  if (settings) {
    // Don't override apiKey if we already have one
    if (!apiKey) {
      apiKey = settings.openai.apiKey || apiKey;
    }
    
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

  // Early validation for obviously invalid API keys to avoid unnecessary API calls
  if (typeof apiKey === 'string' && (
    apiKey.length < 10 ||
    apiKey === 'your-openai-api-key-here' ||
    apiKey === 'test' ||
    apiKey === 'demo' ||
    apiKey === 'invalid' ||
    !apiKey.startsWith('sk-') || // OpenAI keys should start with sk-
    apiKey.includes('placeholder') ||
    apiKey.includes('example')
  )) {
    throw new Error('OpenAI API key is invalid or has expired');
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
export async function callGemini(prompt: string | ChatMessage[], settings?: ModelSettings): Promise<string> {
  let apiKey = '';

  // Priority order: Settings -> Environment variables
  // 1. Use settings if provided (highest priority)
  if (settings && settings.gemini) {
    apiKey = settings.gemini.apiKey || '';
  }

  // 2. Check environment variables as fallback
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }
  
  let model = 'gemini-2.0-flash'; // Default to latest Gemini model
  let temperature = 0.7;
  let maxTokens = 500;
  let systemInstruction = '';
  
  console.log("callGemini: Initial settings", {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none',
    initialModel: model,
    settingsProvided: !!settings,
    geminiSettingsProvided: !!(settings && settings.gemini)
  });
  
  // Start with the first API version
  let cachedApiVersion = null;
  
  // Use settings if provided - with enhanced error handling
  if (settings) {
    // Check if gemini settings exist before trying to access apiKey
    if (settings.gemini) {
      // Don't override apiKey if we already have one
      if (!apiKey) {
        apiKey = settings.gemini.apiKey || apiKey;
      }
      
      console.log("callGemini: Using default model:", model);
      
      // Get parameters based on chat mode
      try {
        const { temperature: modeTemp, maxTokens: modeMaxTokens, systemMessage } = 
          getParametersForMode(settings, 'gemini');
        
        temperature = modeTemp || temperature;
        maxTokens = modeMaxTokens || maxTokens;
        
        // For Gemini, we'll prepend the system message to the prompt
        if (systemMessage) {
          systemInstruction = `${systemMessage}\n\nUser query: `;
        }
      } catch (error) {
        console.warn('Error getting parameters for Gemini:', error);
        // Continue with default parameters
      }
    } else {
      console.warn('Gemini settings not found in settings object, using defaults');
    }
  }

  // Convert input to prompt string
  let promptText = '';
  if (typeof prompt === 'string') {
    promptText = prompt;
  } else {
    // Convert ChatMessage[] to string
    const systemMessage = prompt.find(msg => msg.role === 'system');
    const regularMessages = prompt.filter(msg => msg.role !== 'system');

    // If we have a system message, add it as context at the beginning
    if (systemMessage) {
      promptText += `Context: ${systemMessage.content}\n\n`;
    }

    // Add all messages in order
    for (const msg of regularMessages) {
      const role = msg.role === 'assistant' ? 'AI' : 'User';
      promptText += `${role}: ${msg.content}\n\n`;
    }
  }

  // Ensure we're using a valid model - force gemini-2.0-flash if unsure
  if (!model || model.trim() === '' || !model.includes('gemini')) {
    console.warn(`Invalid model name detected: "${model}", falling back to gemini-2.0-flash`);
    model = 'gemini-2.0-flash';
  }
  
  // Transform model name to API format if needed
  // The model parameter in the URL should be standardized
  const getApiModelName = (modelName: string) => {
    // Map UI friendly names to API model names
    const modelMap: Record<string, string> = {
      'gemini-pro-vision': 'gemini-pro-vision',
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash', 
      'gemini-2.0-flash': 'gemini-2.0-flash',
      'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
    };
    
    // If model isn't in our map, default to gemini-2.0-flash
    if (!modelMap[modelName]) {
      console.warn(`Model name "${modelName}" not found in model map, using gemini-2.0-flash instead`);
      return 'gemini-2.0-flash';
    }
    
    return modelMap[modelName];
  };
  
  const apiModelName = getApiModelName(model);
  console.log("callGemini: Using API model name:", apiModelName);
  
  // More robust API key validation - check for proper format
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set it in Settings or .env.local');
  }

  // Remove the strict format check, only ensure key is not empty
  if (apiKey.trim() === '') {
    throw new Error('Invalid Gemini API key. The key cannot be empty.');
  }

  // Check for placeholder or invalid API keys (including demo keys)
  if (apiKey === 'your_gemini_api_key_here' ||
      apiKey === 'AIzaSyDemoKeyForTesting123456789012345678' ||
      apiKey === 'dShKUGFBdAQfFUUPBUpbEHECR1FYInpvDkBmKWJge0QgcWROeCtb' ||
      apiKey === 'dShKUGFBd0VBVkNWYGVGAmVRRRVKKURoVgFeCX1ZdV1XXlVZYDlh' ||
      (apiKey.includes('placeholder') && !apiKey.includes('demo')) ||
      (apiKey.includes('example') && !apiKey.includes('demo')) ||
      apiKey.length < 10) {
    throw new Error('Invalid Gemini API key detected. Please set a valid API key from https://aistudio.google.com/app/apikey');
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
                text: systemInstruction + promptText
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
            // This is likely a model not found error - try with a different model
            if (apiModelName !== 'gemini-2.0-flash') {
              console.log(`Model ${apiModelName} not found. Falling back to gemini-2.0-flash...`);
              model = 'gemini-2.0-flash';
              
              // Reset API version to try again with the basic model
              currentVersionIndex = 0;
              
              if (retries < MAX_RETRIES) {
                retries++;
                continue;
              }
            }
            const notFoundError = new Error(`Gemini API model not found. Model "${apiModelName}" may not exist or be available for the "${apiVersion}" API version.`);
            notFoundError.status = response.status;
            throw notFoundError;
          } else if (response.status === 429) {
            const rateLimitError = new Error(`Gemini API rate limit exceeded. Please try again later.`);
            rateLimitError.status = response.status;
            throw rateLimitError;
          } else {
            const apiError = new Error(errorJson.error?.message || `Gemini API error: ${response.status} - ${response.statusText}`);
            apiError.status = response.status;
            apiError.responseData = errorJson;
            throw apiError;
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
        
        // API call successful
        
        return data.candidates[0].content.parts[0].text;
      } catch (fetchError) {
        if (fetchError && typeof fetchError === 'object' && 'name' in fetchError && fetchError.name === 'AbortError') {
          const timeoutError = new Error('Gemini API request timed out after 15 seconds');
          timeoutError.cause = fetchError;
          throw timeoutError;
        }
        throw fetchError;
      }
    } catch (error) {
      console.error(`Gemini API error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for specific API version errors and retry with alternate API version
      if (errorMessage.includes('not found for API version') || 
          errorMessage.includes('not supported for generateContent')) {
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
      if (errorMessage.includes('Model not found') || 
          errorMessage.includes('not available') ||
          errorMessage.includes('Gemini API model not found')) {
        // If using newer models but they aren't available, try falling back to gemini-2.0-flash
        if (apiModelName !== 'gemini-2.0-flash') {
          console.log(`Model ${apiModelName} not found. Falling back to gemini-2.0-flash...`);
          model = 'gemini-2.0-flash';
          
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
          // Preserve the original error with its stack trace by using the cause property
          const enhancedError = new Error(`Gemini API error: ${error.message}`);
          enhancedError.cause = error;
          throw enhancedError;
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
  let apiKey = '';

  // Priority order: Settings -> Environment variables
  // 1. Use settings if provided (highest priority)
  if (settings && settings.mistral) {
    apiKey = settings.mistral.apiKey || '';
  }

  // 2. Check environment variables as fallback
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || '';
  }
  
  let model = 'mistral-small'; // Default model
  let temperature = 0.7;
  let maxTokens = 500;
  let finalMessages = [...messages];
  
  if (settings) {
    // Don't override apiKey if we already have one
    if (!apiKey) {
      apiKey = settings.mistral.apiKey || apiKey;
    }
    
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
  
  console.log('Mistral API Key Debug:', {
    hasEnvKey: !!process.env.NEXT_PUBLIC_MISTRAL_API_KEY,
    hasSettingsKey: !!(settings && settings.mistral && settings.mistral.apiKey),
    finalKeyLength: apiKey.length,
    finalKeyPreview: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
  });

  if (!apiKey) {
    throw new Error('Mistral API key is not configured');
  }

  // Early validation for obviously invalid API keys to avoid unnecessary API calls
  if (typeof apiKey === 'string' && (
    apiKey.length < 10 ||
    apiKey === 'your-mistral-api-key-here' ||
    apiKey === 'test' ||
    apiKey === 'demo' ||
    apiKey === 'invalid' ||
    apiKey.startsWith('sk-') || // This is OpenAI format, not Mistral
    apiKey.startsWith('AIza') || // This is Google/Gemini format
    apiKey.includes('placeholder') ||
    apiKey.includes('example')
  )) {
    throw new Error('Mistral API key is invalid or has expired');
  }

  // Maximum retries
  const MAX_RETRIES = 2;
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      console.log(`Calling Mistral API with model: ${model}, attempt ${retries + 1}/${MAX_RETRIES + 1}`);
      
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
        const errorText = await response.text();
        console.log(`Mistral API error text: ${errorText}`);
        
        let errorJson;
        try {
          errorJson = errorText ? JSON.parse(errorText) : { error: { message: 'Empty response' } };
        } catch (e) {
          // If response is not JSON, use the text directly
          console.error(`Mistral API error (${response.status}): ${errorText || response.statusText}`);
          throw new Error(`Mistral API error: ${response.status} - ${errorText || response.statusText}`);
        }
        
        console.error('Mistral API error response:', errorJson);
        
        // Check for specific error types and provide more helpful messages
        if (response.status === 401) {
          const authError = new Error(`Mistral API key is invalid or has expired`);
          authError.status = response.status;
          throw authError;
        } else if (response.status === 404) {
          const notFoundError = new Error(`Mistral API model not found: "${model}". The model may not exist or be available.`);
          notFoundError.status = response.status;
          throw notFoundError;
        } else if (response.status === 429) {
          const rateLimitError = new Error(`Mistral API rate limit exceeded. Please try again later.`);
          rateLimitError.status = response.status;
          throw rateLimitError;
        } else {
          const apiError = new Error(errorJson.error?.message || `Mistral API error: ${response.status} - ${response.statusText}`);
          apiError.status = response.status;
          apiError.responseData = errorJson;
          throw apiError;
        }
      }
      
      const data = await response.json();
      
      // Check if we got a valid response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Unexpected Mistral API response structure:', data);
        throw new Error('Received unexpected response structure from Mistral API');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Mistral API error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // If we're on the final retry, throw the error
      if (retries === MAX_RETRIES) {
        if (error instanceof Error) {
          // Preserve the original error with its stack trace
          const enhancedError = new Error(`Mistral API error: ${error.message}`);
          enhancedError.cause = error;
          throw enhancedError;
        } else {
          throw new Error('Unknown error occurred while calling Mistral API');
        }
      }
      
      // Wait before retrying (exponential backoff: 1s, then a bit longer for next retry)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
      retries++;
    }
  }
  
  // This should not be reached but TypeScript needs it
  throw new Error('Failed to call Mistral API after maximum retries');
}

// Claude API
export async function callClaude(messages: ChatMessage[], settings?: ModelSettings): Promise<string> {
  let apiKey = '';

  // Priority order: Settings -> Environment variables
  // 1. Use settings if provided (highest priority)
  if (settings && settings.claude) {
    apiKey = settings.claude.apiKey || '';
  }

  // 2. Check environment variables as fallback
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '';
  }
  
  let model = 'claude-3-5-sonnet-20240620'; // Default model
  let temperature = 0.7;
  let maxTokens = 500;
  let finalMessages = [...messages];
  
  if (settings) {
    // Don't override apiKey if we already have one
    if (!apiKey) {
      apiKey = settings.claude.apiKey || apiKey;
    }
    
    // Get parameters based on chat mode
    const { temperature: modeTemp, maxTokens: modeMaxTokens, systemMessage } = 
      getParametersForMode(settings, 'claude');
    
    temperature = modeTemp;
    maxTokens = modeMaxTokens;
    
    // Add system message if provided
    if (systemMessage) {
      finalMessages = addSystemMessageIfNeeded(messages, systemMessage);
    }
  }
  
  if (!apiKey) {
    throw new Error('Claude API key is not configured');
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: finalMessages.filter(msg => msg.role !== 'system'),
        system: finalMessages.find(msg => msg.role === 'system')?.content,
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to call Claude API');
    }
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

// Llama API
export async function callLlama(messages: ChatMessage[], settings?: ModelSettings): Promise<string> {
  let apiKey = '';

  // Priority order: Settings -> Environment variables
  // 1. Use settings if provided (highest priority)
  if (settings && settings.llama) {
    apiKey = settings.llama.apiKey || '';
  }

  // 2. Check environment variables as fallback
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_LLAMA_API_KEY || '';
  }
  
  let model = 'llama-3-8b-instruct'; // Default model
  let temperature = 0.7;
  let maxTokens = 500;
  
  if (settings) {
    // Don't override apiKey if we already have one
    if (!apiKey) {
      apiKey = settings.llama.apiKey || apiKey;
    }
    
    // Get parameters based on chat mode
    const { temperature: modeTemp, maxTokens: modeMaxTokens } = 
      getParametersForMode(settings, 'llama');
    
    temperature = modeTemp;
    maxTokens = modeMaxTokens;
  }
  
  if (!apiKey) {
    throw new Error('Llama API key is not configured');
  }
  
  try {
    // Assuming the Llama API is through a service like Together.ai
    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        prompt: formatMessagesForLlama(messages),
        temperature,
        max_tokens: maxTokens
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to call Llama API');
    }
    
    const data = await response.json();
    return data.choices[0].text;
  } catch (error) {
    console.error('Llama API error:', error);
    throw error;
  }
}

function formatMessagesForLlama(messages: ChatMessage[]): string {
  let systemPrompt = '';
  let conversationPrompt = '';
  
  // Extract system message if exists
  const systemMessage = messages.find(msg => msg.role === 'system');
  if (systemMessage) {
    systemPrompt = `<|system|>\n${systemMessage.content}\n`;
  }
  
  // Format conversation
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  conversationPrompt = conversationMessages.map(msg => {
    if (msg.role === 'user') {
      return `<|user|>\n${msg.content}`;
    } else if (msg.role === 'assistant') {
      return `<|assistant|>\n${msg.content}`;
    }
    return '';
  }).join('\n');
  
  // Add final assistant prompt to generate response
  return `${systemPrompt}${conversationPrompt}\n<|assistant|>\n`;
}

// DeepSeek API
export async function callDeepseek(messages: ChatMessage[], settings?: ModelSettings): Promise<string> {
  let apiKey = '';

  // Priority order: Settings -> Environment variables
  // 1. Use settings if provided (highest priority)
  if (settings && settings.deepseek) {
    apiKey = settings.deepseek.apiKey || '';
  }

  // 2. Check environment variables as fallback
  if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
  }
  
  let model = 'deepseek-chat'; // Default model
  let temperature = 0.7;
  let maxTokens = 500;
  let finalMessages = [...messages];
  
  if (settings) {
    // Don't override apiKey if we already have one
    if (!apiKey) {
      apiKey = settings.deepseek.apiKey || apiKey;
    }
    
    // Get parameters based on chat mode
    const { temperature: modeTemp, maxTokens: modeMaxTokens, systemMessage } = 
      getParametersForMode(settings, 'deepseek');
    
    temperature = modeTemp;
    maxTokens = modeMaxTokens;
    
    // Add system message if provided
    if (systemMessage) {
      finalMessages = addSystemMessageIfNeeded(messages, systemMessage);
    }
  }
  
  if (!apiKey) {
    throw new Error('DeepSeek API key is not configured');
  }
  
  try {
    // Deepseek API follows OpenAI format
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
      throw new Error(error.error?.message || 'Failed to call Deepseek API');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Deepseek API error:', error);
    throw error;
  }
}



// Function to validate API configuration
export function validateApiConfiguration() {
  // Check for API keys in environment variables only
  const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const mistralKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || '';
  const claudeKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '';
  const llamaKey = process.env.NEXT_PUBLIC_LLAMA_API_KEY || '';
  const deepseekKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
  
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
    claude: {
      configured: Boolean(claudeKey),
      keyPrefix: claudeKey ? claudeKey.substring(0, 3) + '...' : 'not set'
    },
    llama: {
      configured: Boolean(llamaKey),
      keyPrefix: llamaKey ? llamaKey.substring(0, 3) + '...' : 'not set'
    },
    deepseek: {
      configured: Boolean(deepseekKey),
      keyPrefix: deepseekKey ? deepseekKey.substring(0, 3) + '...' : 'not set'
    },
    anyConfigured: Boolean(openaiKey || geminiKey || mistralKey || claudeKey || llamaKey || deepseekKey)
  };
  
  return results;
}

// Demo mode responses
const getDemoResponse = (provider: AIProvider, userMessage: string, messages: ChatMessage[]): string => {
  // Check if this is a request for suggestions (JSON format)
  const isJsonRequest = userMessage.includes('JSON') ||
                       userMessage.includes('followUpQuestions') ||
                       userMessage.includes('topicSuggestions') ||
                       userMessage.includes('recommendedPrompts') ||
                       messages.some(msg => msg.content.includes('Format your response as JSON'));

  if (isJsonRequest) {
    // Return demo suggestions in JSON format
    const demoSuggestions = {
      followUpQuestions: [
        "Would you like me to elaborate on any specific point?",
        "Is there a particular aspect you'd like more information about?",
        "Did this address your question, or would you like a different approach?"
      ],
      topicSuggestions: [
        `Tell me more about ${provider}`,
        `What are the most important things to know about ${provider}?`,
        `How does ${provider} compare to other AI providers?`
      ],
      recommendedPrompts: [
        "Explain this concept in simple terms",
        "Give me a step-by-step guide for this",
        "What are the pros and cons of this approach?"
      ]
    };

    return JSON.stringify(demoSuggestions, null, 2);
  }

  // Regular chat responses
  const responses = {
    openai: [
      "Hello! I'm a demo OpenAI assistant. This is a simulated response since no real API key is configured. To use the real OpenAI API, please add your API key in Settings.",
      "This is a demo response from OpenAI. The chat interface is working perfectly! Add a real API key to get actual AI responses.",
      "Demo mode is active for OpenAI. Your message was received successfully. Configure a real API key to enable full functionality."
    ],
    gemini: [
      "Hi there! I'm simulating a Gemini response since no valid API key is configured. To use real Gemini AI, get an API key from https://aistudio.google.com/app/apikey",
      "This is a demo Gemini response. Your chat system is working correctly! Add a real Gemini API key to unlock the full potential.",
      "Demo mode: Gemini simulation active. The interface is functioning properly. Set up a real API key for actual AI conversations."
    ],
    mistral: [
      "Bonjour! This is a demo Mistral response. Your chat application is working well! To use real Mistral AI, please configure a valid API key.",
      "Demo Mistral response here. The system is functioning correctly. Add a real Mistral API key from https://console.mistral.ai/ to enable full features.",
      "Simulated Mistral response - everything is working! Get a real API key to unlock actual AI conversations."
    ],
    claude: [
      "Hello! This is a demo Claude response. Your application is working perfectly! To use real Claude AI, add your Anthropic API key.",
      "Demo mode: Claude simulation. The chat interface is functioning correctly. Configure a real API key for actual AI responses.",
      "This is a simulated Claude response. Everything looks good! Add a real Anthropic API key to enable full functionality."
    ],
    llama: [
      "Hey! Demo Llama response here. Your chat system is working great! Add a real Together.ai API key to use actual Llama models.",
      "This is a demo Llama response. The interface is functioning perfectly! Configure a real API key for full AI capabilities.",
      "Demo mode: Llama simulation active. Everything is working correctly! Set up a real API key for actual conversations."
    ],
    deepseek: [
      "Hello! Demo DeepSeek response. Your application is working excellently! Add a real DeepSeek API key to unlock full AI features.",
      "This is a simulated DeepSeek response. The chat system is functioning perfectly! Configure a real API key for actual AI conversations.",
      "Demo DeepSeek mode active. Everything looks great! Get a real API key to enable full functionality."
    ]
  };

  const providerResponses = responses[provider] || responses.openai;
  const randomIndex = Math.floor(Math.random() * providerResponses.length);
  return providerResponses[randomIndex];
};

// Unified API function to handle all providers
export async function callAI(messages: ChatMessage[], provider: AIProvider, settings?: ModelSettings): Promise<string> {
  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(messages, settings);
      case 'gemini':
        return await callGemini(messages, settings);
      case 'mistral':
        return await callMistral(messages, settings);
      case 'claude':
        return await callClaude(messages, settings);
      case 'llama':
        return await callLlama(messages, settings);
      case 'deepseek':
        return await callDeepseek(messages, settings);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  } catch (error) {
    // If API call fails due to invalid/missing API key, return demo response
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('API key') ||
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('Invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('401')) {

      console.log(`🎭 Demo mode activated for ${provider} due to API key issue`);

      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const userMessage = messages[messages.length - 1]?.content || '';
      return getDemoResponse(provider, userMessage, messages);
    }

    // Re-throw other errors
    throw error;
  }
}
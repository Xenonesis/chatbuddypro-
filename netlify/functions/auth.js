// Optimized Netlify function to handle auth-related requests
const { createClient } = require('@supabase/supabase-js');

// Create a lightweight Supabase client with minimal options
const createLightClient = (url, key) => {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  });
};

exports.handler = async (event, context) => {
  // Parse the URL path from the Netlify event
  const path = event.path.replace(/^\/\.netlify\/functions\/auth/, '');
  
  // Get code from query parameters
  const code = event.queryStringParameters?.code;
  
  // Initialize Supabase client with minimal configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase credentials not configured' }),
    };
  }

  // Handle callback request
  if (path === '/callback' && code) {
    try {
      // Create client just for this operation
      const supabase = createLightClient(supabaseUrl, supabaseKey);
      
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      
      // Redirect to the dashboard
      return {
        statusCode: 302,
        headers: {
          Location: '/dashboard',
        },
        body: 'Redirecting...',
      };
    } catch (error) {
      console.error('Auth callback error:', error.message);
      
      // Redirect to login page with error
      return {
        statusCode: 302,
        headers: {
          Location: '/auth/login?error=callback_error',
        },
        body: 'Redirecting...',
      };
    }
  }
  
  // Default fallback for other auth requests
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not found' }),
  };
}; 
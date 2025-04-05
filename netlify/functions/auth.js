// Netlify function to handle auth-related requests
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  // Parse the URL path from the Netlify event
  const path = event.path.replace(/^\/\.netlify\/functions\/auth/, '');
  
  // Get code from query parameters
  const params = new URLSearchParams(event.queryStringParameters);
  const code = params.get('code');
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase credentials not configured' }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Handle callback request
  if (path === '/callback' && code) {
    try {
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
      console.error('Auth callback error:', error);
      
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
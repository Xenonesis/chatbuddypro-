// Simple middleware for Netlify Edge Functions
export default async function middleware(req) {
  const url = new URL(req.url);
  
  // Skip middleware for Next.js static assets to prevent MIME type conflicts
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }
  
  // Serve static files as-is with proper headers
  const staticExtensions = ['.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.json', '.woff', '.woff2', '.map'];
  if (staticExtensions.some(ext => url.pathname.endsWith(ext))) {
    const response = new Response(null, { status: 200 });
    
    // Set proper MIME types
    if (url.pathname.endsWith('.css')) {
      response.headers.set('Content-Type', 'text/css; charset=utf-8');
    } else if (url.pathname.endsWith('.js')) {
      response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    }
    
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }
  
  // Otherwise, handle as SPA route
  return;
} 
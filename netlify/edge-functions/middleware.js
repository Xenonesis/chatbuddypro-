// Simple middleware for Netlify Edge Functions
export default async function middleware(req) {
  const url = new URL(req.url);
  
  // Serve static files as-is
  const staticExtensions = ['.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.json', '.woff', '.woff2'];
  if (staticExtensions.some(ext => url.pathname.endsWith(ext))) {
    return;
  }
  
  // API routes - pass through to the server
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Otherwise, handle as SPA route
  return;
} 
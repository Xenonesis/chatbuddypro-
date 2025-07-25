import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware refreshes the user's session and adds the user to the request
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();
    
    return res;
  } catch (e) {
    return res;
  }
} 
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/update-password',
  '/auth/verify',
  '/auth/callback',
  '/privacy',
  '/terms',
  '/compliance',
  '/security'
];

// Define routes that should redirect to dashboard if user is already logged in
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;
  
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if the current path is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    
    // If user is not authenticated and trying to access a protected route
    if (!session && !isPublicRoute && pathname !== '/') {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // If user is not authenticated and trying to access root, show landing page
    // If user is authenticated and accessing root, redirect to dashboard
    if (pathname === '/') {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      // Allow unauthenticated users to see the landing page
      return res;
    }
    
    return res;
  } catch (e) {
    console.error('Auth middleware error:', e);
    // On error, redirect to login for protected routes
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    if (!isPublicRoute && pathname !== '/') {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 
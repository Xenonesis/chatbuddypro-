'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // Clean up any tokens before signing in
      if (typeof window !== 'undefined') {
        const storageKeys = Object.keys(localStorage);
        for (const key of storageKeys) {
          if (key.startsWith('sb-') && key.includes('-auth-token')) {
            localStorage.removeItem(key);
          }
        }
        sessionStorage.clear();
      }
      
      const { data, error } = await signIn(email, password);
      
      if (error) {
        let errorMessage = 'Failed to sign in';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email before signing in';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many sign-in attempts. Please try again later';
        } else if (error.message.includes('Refresh Token')) {
          errorMessage = 'Authentication error. Please try clearing your cache and cookies';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      if (data) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setError('An unexpected error occurred. Please try again');
      setLoading(false);
    }
  };

  const handleFullReset = () => {
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Force reload
      window.location.href = '/auth/login?reset=true';
    } catch (error) {
      console.error('Error during full reset:', error);
      setError('Failed to reset. Please try again or clear browser data manually.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your email and password to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/10 dark:border-red-700 text-red-800 dark:text-red-300">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
          
          {error?.includes('Authentication error') || error?.includes('Refresh Token') ? (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-muted-foreground mb-2">
                Having trouble signing in? Try resetting your authentication state:
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleFullReset}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Authentication
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LogIn, 
  RefreshCw, 
  Sparkles, 
  Bot, 
  User, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Github, 
  Mail, 
  Lock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check if email is stored in localStorage (for remember me)
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
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
          errorMessage = 'Authentication error. Please try again';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many sign-in attempts. Please try again later';
        } else if (error.message.includes('Refresh Token')) {
          errorMessage = 'Authentication error. Please try clearing your cache and cookies';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
        
        setGeneralError(errorMessage);
        setLoading(false);
        return;
      }
      
      if (data && data.user) {
        console.log('Login successful, user:', data.user.id);
        // Check for redirectTo parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirectTo') || '/dashboard';
        console.log('Redirecting to:', redirectTo);
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      }
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setGeneralError('An unexpected error occurred. Please try again');
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    try {
      // Get redirectTo parameter from URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo') || '/chat';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });
      
      if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        setGeneralError(`Failed to sign in with ${provider}. Please try again.`);
      }
    } catch (err) {
      console.error(`Unexpected error during ${provider} sign in:`, err);
      setGeneralError('An unexpected error occurred. Please try again');
    } finally {
      setOauthLoading(null);
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
      setGeneralError('Failed to reset. Please try again or clear browser data manually.');
    }
  };

  if (!mounted) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-20 w-[200px] h-[200px] bg-gradient-to-r from-blue-100/30 to-transparent dark:from-blue-600/10 dark:to-transparent rounded-full blur-2xl"></div>
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '30%', right: '15%' }}
        ></motion.div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <motion.div 
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg mb-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          <Bot className="h-8 w-8 text-white" />
        </motion.div>
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ChatBuddy
        </motion.h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <Card className="border-slate-200/70 dark:border-slate-800/70 shadow-xl dark:shadow-slate-900/20 backdrop-blur-sm glass-light dark:glass-dark overflow-hidden">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">2025 Edition</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center mt-4">Welcome Back</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {generalError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 text-red-800 dark:text-red-300 flex items-start gap-2"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{generalError}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Social Login Options */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={oauthLoading !== null}
                className="w-full h-11 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2"
              >
                {oauthLoading === 'google' ? (
                  <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </Button>
              
              <Button 
                variant="outline" 
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                disabled={oauthLoading !== null}
                className="w-full h-11 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2"
              >
                {oauthLoading === 'github' ? (
                  <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Github className="h-5 w-5" />
                )}
                Continue with GitHub
              </Button>
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">Or continue with</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex gap-1.5 items-center">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    className={`h-11 px-4 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 pr-10 ${
                      emailError ? 'border-red-500 dark:border-red-700 focus:border-red-500 dark:focus:border-red-700 focus:ring-red-500/20 dark:focus:ring-red-700/20' : ''
                    }`}
                    required
                  />
                  <AnimatePresence>
                    {emailError && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
                      >
                        <AlertCircle className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {emailError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-500 mt-1"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium flex gap-1.5 items-center">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    Password
                  </Label>
                  <Link href="/auth/reset-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    className={`h-11 px-4 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-blue-500/20 dark:focus:ring-blue-600/20 pr-10 ${
                      passwordError ? 'border-red-500 dark:border-red-700 focus:border-red-500 dark:focus:border-red-700 focus:ring-red-500/20 dark:focus:ring-red-700/20' : ''
                    }`}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-500 mt-1"
                    >
                      {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember my email
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-blue-500/10 dark:shadow-blue-500/5 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign in
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="w-full text-center text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Create an account
              </Link>
            </div>
            
            {generalError?.includes('Authentication error') || generalError?.includes('Refresh Token') ? (
              <div className="w-full pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">
                  Having trouble signing in? Try resetting your authentication state:
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-sm h-9 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  onClick={handleFullReset}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Reset Authentication
                </Button>
              </div>
            ) : null}
          </CardFooter>
        </Card>
      </motion.div>

      <div className="relative z-10 mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; 2025 ChatBuddy • All rights reserved
      </div>
    </div>
  );
} 
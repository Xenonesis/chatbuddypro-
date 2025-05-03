'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bot, Sparkles, UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to sign up',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Success',
        description: 'Please check your email to confirm your account',
      });
      
      router.push('/auth/verify');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-[200px] h-[200px] bg-gradient-to-r from-purple-100/30 to-transparent dark:from-purple-600/10 dark:to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg mb-4">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          ChatBuddy
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-slate-200/70 dark:border-slate-800/70 shadow-xl dark:shadow-slate-900/20 backdrop-blur-sm glass-light dark:glass-dark">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30">
                <Sparkles className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">2025 Edition</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center mt-4">Create an Account</CardTitle>
            <CardDescription className="text-center">Sign up to get started with our advanced chatbot platform</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 px-4 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:border-purple-500 dark:focus:border-purple-600 focus:ring-purple-500/20 dark:focus:ring-purple-600/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 px-4 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:border-purple-500 dark:focus:border-purple-600 focus:ring-purple-500/20 dark:focus:ring-purple-600/20"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 px-4 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:border-purple-500 dark:focus:border-purple-600 focus:ring-purple-500/20 dark:focus:ring-purple-600/20"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-md shadow-purple-500/10 dark:shadow-purple-500/5 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create account
                  </>
                )}
              </Button>
              <div className="w-full text-center text-sm">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <div className="relative z-10 mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; 2025 ChatBuddy • All rights reserved
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, MailCheck, Bot, Sparkles, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Missing email',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send reset email',
          variant: 'destructive',
        });
        return;
      }
      
      setIsSubmitted(true);
      toast({
        title: 'Email sent',
        description: 'Check your inbox for password reset instructions',
      });
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

  if (isSubmitted) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-20 w-[200px] h-[200px] bg-gradient-to-r from-amber-100/30 to-transparent dark:from-amber-600/10 dark:to-transparent rounded-full blur-2xl"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 mb-8 flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg mb-4">
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
                <Link href="/auth/login" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">2025 Edition</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center mt-4">Check Your Email</CardTitle>
              <CardDescription className="text-center">We've sent password reset instructions to your email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 p-6 rounded-xl border border-amber-100 dark:border-amber-800/30 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                  <MailCheck className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-center text-slate-700 dark:text-slate-300 font-medium">
                  Please check your email inbox and follow the instructions to reset your password.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Link href="/auth/login" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Return to Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>

        <div className="relative z-10 mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          &copy; 2025 ChatBuddy • All rights reserved
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-100/40 dark:bg-amber-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-[200px] h-[200px] bg-gradient-to-r from-amber-100/30 to-transparent dark:from-amber-600/10 dark:to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg mb-4">
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
              <Link href="/auth/login" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">2025 Edition</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center mt-4">Reset Password</CardTitle>
            <CardDescription className="text-center">Enter your email to receive a password reset link</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100/70 dark:border-amber-800/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  We'll send you a secure link to reset your password. The link will expire after 24 hours.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 px-4 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:border-amber-500 dark:focus:border-amber-600 focus:ring-amber-500/20 dark:focus:ring-amber-600/20"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg shadow-md shadow-amber-500/10 dark:shadow-amber-500/5 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Sending email...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
              <div className="w-full text-center text-sm">
                <Link
                  href="/auth/login"
                  className="text-amber-600 dark:text-amber-400 hover:underline font-medium flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to login
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
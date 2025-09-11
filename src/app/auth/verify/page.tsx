'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck, ArrowLeft, Bot, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-100/40 dark:bg-green-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-20 w-[200px] h-[200px] bg-gradient-to-r from-green-100/30 to-transparent dark:from-green-600/10 dark:to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-teal-600 shadow-lg mb-4">
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
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                <Sparkles className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">2025 Edition</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center mt-4">Account Ready!</CardTitle>
            <CardDescription className="text-center">Your account has been created and is ready to use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-b from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-800/30 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <MailCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-center text-slate-700 dark:text-slate-300 font-medium">
                Your account is now active and ready to use. You can start chatting right away!
              </p>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200/70 dark:border-slate-800/50">
              <p className="font-medium">What you can do now:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Start chatting with AI assistants</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Customize your settings and preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Explore different AI models and features</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/dashboard" className="w-full">
              <Button 
                className="w-full h-11 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg shadow-md transition-all duration-200"
              >
                <Bot className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/chat" className="w-full">
              <Button 
                variant="outline" 
                className="w-full h-11 border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
              >
                Start Chatting
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
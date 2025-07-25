'use client';

import { useState, useEffect, useRef } from 'react';
import Chat from '@/components/Chat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MotionButton } from '@/components/ui/motion-button';
import { MessageSquare, Sparkles, Bot, Shield, Database, Key, ArrowRight, User, Zap, ChevronDown, Brain, CheckCircle, ChevronRight, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import BackToTop from '@/components/BackToTop';
import ResponsiveContainer, { ResponsiveSection } from '@/components/Layout/ResponsiveContainer';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ModernFooter } from '@/components/ui-custom/ModernFooter';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Always show welcome on the landing page
    // but skip for returning users who are logged in
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (hasVisited && user) {
      // Navigate to dashboard if user is logged in
      router.push('/dashboard');
      setShowWelcome(false);
    } else {
      localStorage.setItem('hasVisitedBefore', 'true');
    }
    setMounted(true);
    
    // Add JS detection class to prevent hydration mismatches
    document.documentElement.classList.add('js-ready');
  }, [user, router]);

  const handleStartChat = () => {
    // Redirect to login page instead of just hiding welcome
    router.push('/auth/login');
  };

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add hydration error prevention by avoiding rendering SSR-incompatible elements until mounted
  const isBrowser = typeof window !== 'undefined';

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading ChatBuddy...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12,
        duration: 0.6
      }
    },
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center min-h-[calc(100vh-64px)] pb-20 md:pb-0">
      {showWelcome ? (
        <motion.div
          initial="hidden"
          animate={mounted ? "visible" : "hidden"} 
          variants={containerVariants}
          className="w-full mx-auto space-y-20 pb-8"
        >
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-slate-900 dark:via-[#0f172a] dark:to-[#0c1222] py-12 sm:py-20 md:py-28 lg:py-32">
            {/* Enhanced Background elements with improved visual depth */}
            <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]"></div>
            
            {/* Animated gradient orbs */}
            <div className="absolute h-full w-full">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 via-cyan-300/15 to-indigo-400/20 dark:from-blue-500/30 dark:via-cyan-400/20 dark:to-indigo-500/25 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/15 via-pink-300/10 to-violet-400/15 dark:from-purple-500/25 dark:via-pink-400/15 dark:to-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/10 via-teal-300/8 to-cyan-400/12 dark:from-emerald-500/20 dark:via-teal-400/12 dark:to-cyan-500/18 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
            </div>
            
            {/* Enhanced border gradients */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 dark:via-blue-400/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 dark:via-purple-400/40 to-transparent"></div>
            
            {/* Subtle mesh pattern overlay */}
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                <motion.div 
                  variants={itemVariants} 
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full glass-light dark:glass-dark border border-blue-200/80 dark:border-blue-500/30 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20 overflow-hidden group hover:scale-105 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-blue-500/10 -z-10"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent dark:via-blue-400/10 -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-700"></div>
                      <span className="relative flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-md">
                        <Sparkles className="h-4 w-4 text-white animate-pulse" />
                      </span>
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-200 tracking-wide">✨ New for 2025: Enhanced AI Models & Security</span>
                    </motion.div>
                    
                    <div className="space-y-4">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-none">
                        <motion.span 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="block bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent font-extrabold"
                        >
                          ChatBuddy
                        </motion.span>
                        <motion.span 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2 text-slate-700 dark:text-slate-200 font-semibold"
                        >
                          Your AI Assistant for{' '}
                          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            2025 & Beyond
                          </span>
                        </motion.span>
                      </h1>
                    </div>
                  </div>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="text-lg sm:text-xl text-slate-600 dark:text-blue-100/90 max-w-2xl leading-relaxed font-medium"
                  >
                    Experience the next evolution of AI with{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">quantum-secure encryption</span>,{' '}
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">context-aware responses</span>, and seamless integration with the latest 2025 AI models - all in one beautiful, intuitive interface.
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="flex flex-col sm:flex-row gap-4 button-stack"
                  >
                    <MotionButton 
                      onClick={handleStartChat}
                      size="lg"
                      animationType="scale"
                      className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 dark:shadow-blue-500/30 border-0 h-14 px-10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 focus:ring-offset-2 group overflow-hidden"
                      aria-label="Start Chatting Now"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <MessageSquare className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                        <span className="font-semibold text-base">Start Chatting Now</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                      </div>
                    </MotionButton>
                    {!user && (
                      <Link href="/auth/signup" className="sm:w-auto w-full">
                        <MotionButton 
                          variant="outline" 
                          size="lg"
                          animationType="lift"
                          className="relative glass-light dark:glass-dark text-blue-700 dark:text-blue-100 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 h-14 px-10 rounded-full backdrop-blur-sm transition-all duration-300 hover:border-blue-400/60 dark:hover:border-blue-400/60 w-full focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 focus:ring-offset-2 group border-2 border-blue-200/60 dark:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
                          aria-label="Create Free Account"
                        >
                          <div className="relative flex items-center justify-center">
                            <User className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                            <span className="font-semibold text-base">Create Free Account</span>
                            <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" aria-hidden="true" />
                          </div>
                        </MotionButton>
                      </Link>
                    )}
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    className="flex flex-wrap gap-6 pt-6"
                  >
                    <button
                      type="button"
                      onClick={scrollToFeatures}
                      aria-label="Scroll to features section"
                      className="flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl px-4 py-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm"
                      tabIndex={0}
                    >
                      <span className="mr-2 group-hover:underline font-medium">🚀 Explore 2025 Features</span>
                      <ChevronDown className="h-4 w-4 animate-bounce group-hover:translate-y-1 transition-transform duration-200" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={scrollToHowItWorks}
                      aria-label="Scroll to how it works section"
                      className="flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl px-4 py-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm"
                      tabIndex={0}
                    >
                      <span className="mr-2 group-hover:underline font-medium">⚡ See How It Works</span>
                      <ChevronDown className="h-4 w-4 animate-bounce group-hover:translate-y-1 transition-transform duration-200" aria-hidden="true" />
                    </button>
                  </motion.div>
                </motion.div>

                <motion.div 
                  variants={itemVariants} 
                  className="relative hidden lg:block h-[400px] sm:h-[500px]"
                >
                  <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90 backdrop-blur-xl">
                    {/* Enhanced window header */}
                    <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-sm flex items-center px-6 border-b border-slate-700/50">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500 shadow-sm hover:bg-red-400 transition-colors cursor-pointer"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-sm hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm hover:bg-green-400 transition-colors cursor-pointer"></div>
                      </div>
                      <div className="mx-auto flex items-center text-sm text-slate-300 font-medium">
                        <Brain className="h-5 w-5 mr-2 text-blue-400 animate-pulse" />
                        ChatBuddy 2025 - AI Assistant
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">Online</span>
                      </div>
                    </div>
                    
                    {/* Enhanced background gradient */}
                    <div className="absolute top-14 bottom-0 left-0 right-0 bg-gradient-to-b from-slate-800/30 via-transparent to-slate-900/50"></div>
                    
                    <div className="pt-14 p-6 h-full">
                      <div className="flex flex-col h-full overflow-hidden space-y-4">
                        {/* User message with enhanced styling */}
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 1.2 }}
                          className="bg-gradient-to-r from-slate-700/60 via-slate-600/50 to-slate-700/60 p-4 rounded-2xl text-white backdrop-blur-sm shadow-lg border border-slate-600/30 ml-auto max-w-[80%]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-lg">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">What's new in ChatBuddy for 2025?</p>
                              <span className="text-xs text-slate-300 mt-1 block">Just now</span>
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* AI response with enhanced styling and typing animation */}
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 1.5 }}
                          className="bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-purple-600/25 p-4 rounded-2xl text-white backdrop-blur-sm shadow-xl border border-blue-500/30 mr-auto max-w-[85%]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-lg animate-pulse">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-blue-300">ChatBuddy AI</span>
                                <div className="flex space-x-1">
                                  <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce"></div>
                                  <div className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-1 h-1 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                              <p className="text-sm leading-relaxed">
                                🚀 We've added <span className="text-cyan-300 font-semibold">quantum-secure encryption</span>, <span className="text-green-300 font-semibold">context-aware AI responses</span>, and integration with the latest 2025 AI models including <span className="text-yellow-300 font-semibold">GPT-5</span> and <span className="text-pink-300 font-semibold">Claude 3</span>. Plus, our UI is now more intuitive than ever! ✨
                              </p>
                              <span className="text-xs text-slate-400 mt-2 block">Powered by Advanced AI • Just now</span>
                            </div>
                          </div>
                        </motion.div>
                        
                        <div className="flex-1"></div>
                        
                        {/* Enhanced input area */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 1.8 }}
                          className="border-t border-slate-700/50 pt-4"
                        >
                          <div className="glass-dark rounded-2xl flex items-center p-3 shadow-inner backdrop-blur-sm border border-slate-600/30 hover:border-blue-500/50 transition-all duration-300">
                            <input 
                              type="text" 
                              className="bg-transparent border-0 text-white text-sm flex-1 focus:outline-none px-3 placeholder-slate-400" 
                              placeholder="Ask me anything about 2025 features..." 
                              disabled 
                            />
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl p-2 transition-all duration-200">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced floating decoration elements */}
                  <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-500/15 rounded-full blur-3xl animate-float"></div>
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 -right-4 w-32 h-32 bg-gradient-to-r from-purple-500/10 via-pink-500/8 to-violet-500/12 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
                </motion.div>
              </div>

              <motion.div 
                variants={itemVariants}
                className="mt-20 flex flex-wrap justify-center items-center gap-4 sm:gap-6"
              >
                <EnhancedTooltip 
                  content="Chat with OpenAI GPT-5, Claude 3, Gemini Pro and more advanced 2025 AI models" 
                  side="top"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-slate-800/70 dark:to-slate-700/50 px-5 py-3 rounded-full text-sm shadow-lg backdrop-blur-sm border border-blue-200/30 dark:border-slate-600/30 hover:scale-105 hover:shadow-blue-500/20 transition-all duration-300 group">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
                    <span className="font-medium text-slate-700 dark:text-white">Multiple AI Models</span>
                  </div>
                </EnhancedTooltip>
                
                <EnhancedTooltip 
                  content="Your data is protected with quantum-secure encryption and advanced authentication" 
                  side="top"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-slate-800/70 dark:to-slate-700/50 px-5 py-3 rounded-full text-sm shadow-lg backdrop-blur-sm border border-emerald-200/30 dark:border-slate-600/30 hover:scale-105 hover:shadow-emerald-500/20 transition-all duration-300 group">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-slate-700 dark:text-white">Quantum Security</span>
                  </div>
                </EnhancedTooltip>
                
                <EnhancedTooltip 
                  content="Save and access your past conversations with intelligent context awareness" 
                  side="top"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-indigo-500/10 dark:from-slate-800/70 dark:to-slate-700/50 px-5 py-3 rounded-full text-sm shadow-lg backdrop-blur-sm border border-violet-200/30 dark:border-slate-600/30 hover:scale-105 hover:shadow-violet-500/20 transition-all duration-300 group">
                    <Database className="h-5 w-5 text-violet-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-slate-700 dark:text-white">Smart History</span>
                  </div>
                </EnhancedTooltip>
                
                <EnhancedTooltip 
                  content="Securely store and manage your API keys with enterprise-grade encryption" 
                  side="top"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-yellow-500/10 dark:from-slate-800/70 dark:to-slate-700/50 px-5 py-3 rounded-full text-sm shadow-lg backdrop-blur-sm border border-orange-200/30 dark:border-slate-600/30 hover:scale-105 hover:shadow-orange-500/20 transition-all duration-300 group">
                    <Key className="h-5 w-5 text-orange-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform duration-200" />
                    <span className="font-medium text-slate-700 dark:text-white">Secure Keys</span>
                  </div>
                </EnhancedTooltip>
              </motion.div>
          </div>

            {/* Bottom wave decoration */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
                <path fill="rgb(241 245 249)" fillOpacity="0.03" d="M0,192L48,170.7C96,149,192,107,288,112C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,101.3C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>
          </section>

          {/* Enhanced Features Section */}
          <section ref={featuresRef} className="relative py-12 sm:py-20 md:py-28 overflow-hidden">
            {/* Enhanced background with animated elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950"></div>
            
            {/* Animated background orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-gradient-to-r from-blue-400/10 via-indigo-400/5 to-purple-400/10 rounded-full blur-3xl animate-float-slow"></div>
              <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-emerald-400/8 via-teal-400/4 to-cyan-400/8 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
            </div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-slate-100/30 dark:bg-grid-white/[0.01] [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Enhanced section header */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-500/20"
                >
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">2025 Features</span>
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Experience the Next Generation
                  <span className="block mt-2">of AI Collaboration</span>
                </h2>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Discover cutting-edge features designed for the future of AI interaction. From quantum security to context-aware intelligence, every feature is built for 2025 and beyond.
                </p>
              </motion.div>

              {/* Enhanced feature cards */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
              >
                {[
                  {
                    icon: <Bot className="h-6 w-6 text-white" />,
                    iconBg: "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
                    title: "Advanced AI Models",
                    subtitle: "Next-Gen Intelligence",
                    description: "Access the latest 2025 AI models including GPT-5, Claude 3, and Gemini Pro. Experience enhanced reasoning, creativity, and technical capabilities with unprecedented accuracy.",
                    features: ["GPT-5 Integration", "Claude 3 Support", "Gemini Pro Access", "Custom Model Training"],
                    borderColor: "border-blue-500/30",
                    shadowColor: "shadow-blue-500/10 dark:shadow-blue-500/20",
                    hoverShadow: "group-hover:shadow-blue-500/25 dark:group-hover:shadow-blue-500/30",
                    gradientBg: "from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-900/10 dark:via-indigo-900/5 dark:to-purple-900/10"
                  },
                  {
                    icon: <Shield className="h-6 w-6 text-white" />,
                    iconBg: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600",
                    title: "Quantum-Secure Encryption",
                    subtitle: "Future-Proof Security",
                    description: "Revolutionary quantum-resistant encryption protects your data against next-generation threats. Advanced authentication and real-time monitoring ensure maximum security.",
                    features: ["Post-Quantum Crypto", "Zero Trust Architecture", "SOC 2 Compliance", "Real-time Monitoring"],
                    borderColor: "border-emerald-500/30",
                    shadowColor: "shadow-emerald-500/10 dark:shadow-emerald-500/20",
                    hoverShadow: "group-hover:shadow-emerald-500/25 dark:group-hover:shadow-emerald-500/30",
                    gradientBg: "from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-900/10 dark:via-teal-900/5 dark:to-cyan-900/10"
                  },
                  {
                    icon: <Brain className="h-6 w-6 text-white" />,
                    iconBg: "bg-gradient-to-br from-violet-500 via-purple-600 to-pink-600",
                    title: "Context-Aware AI",
                    subtitle: "Intelligent Memory",
                    description: "Experience truly intelligent conversations with advanced context awareness. Our AI understands your workflow, remembers interactions, and provides personalized responses.",
                    features: ["Memory System", "Workflow Integration", "Personalized Responses", "Learning Algorithms"],
                    borderColor: "border-violet-500/30",
                    shadowColor: "shadow-violet-500/10 dark:shadow-violet-500/20",
                    hoverShadow: "group-hover:shadow-violet-500/25 dark:group-hover:shadow-violet-500/30",
                    gradientBg: "from-violet-50/50 via-purple-50/30 to-pink-50/50 dark:from-violet-900/10 dark:via-purple-900/5 dark:to-pink-900/10"
                  }
                ].map((feature, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className={cn(
                      "relative overflow-hidden group transition-all duration-500",
                      "hover:shadow-2xl hover:-translate-y-3",
                      "glass-enhanced border-2",
                      feature.borderColor,
                      feature.shadowColor,
                      feature.hoverShadow,
                      "h-full"
                    )}>
                      {/* Animated background gradient */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        feature.gradientBg
                      )}></div>
                      
                      {/* Top gradient line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Floating decoration */}
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent group-hover:scale-110 transition-transform duration-500"></div>
                      
                      <CardHeader className="relative z-10 pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl transition-all duration-300",
                            "group-hover:scale-110 group-hover:rotate-3",
                            feature.iconBg
                          )}>
                            {feature.icon}
                          </div>
                          <div className="text-right">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            {feature.subtitle}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative z-10 space-y-6">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                          {feature.description}
                        </p>
                        
                        {/* Feature list */}
                        <div className="space-y-3">
                          {feature.features.map((item, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: idx * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:scale-125 transition-transform duration-200"></div>
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="relative z-10 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300"
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Enhanced How It Works Section */}
          <section ref={howItWorksRef} className="relative py-20 sm:py-28 overflow-hidden">
            {/* Enhanced background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"></div>
            
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/8 via-indigo-400/4 to-purple-400/8 rounded-full blur-3xl animate-float-slow"></div>
              <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/6 via-teal-400/3 to-cyan-400/6 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
            </div>
            
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-grid-slate-100/20 dark:bg-grid-white/[0.01] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Enhanced section header */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-20"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 border border-emerald-200/50 dark:border-emerald-500/20"
                >
                  <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Simple Process</span>
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-900 dark:from-white dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">
                  How It Works
                  <span className="block mt-2 text-3xl sm:text-4xl">Get Started in Minutes</span>
                </h2>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Experience our streamlined 2025 setup process with quantum-secure authentication and instant access to next-generation AI models. No complex configuration required.
                </p>
              </motion.div>

              {/* Enhanced step cards with connecting lines */}
              <div className="relative">
                {/* Connecting line for desktop */}
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
                  <div className="relative h-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 dark:from-blue-800/50 dark:via-emerald-800/50 dark:to-purple-800/50 rounded-full"></div>
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 rounded-full origin-left"
                    ></motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                  {[
                    {
                      icon: <User className="h-7 w-7" />,
                      title: "Create an Account",
                      step: "01",
                      description: "Sign up instantly with biometric authentication or quantum-secure social login. Get immediate access to our 2025 AI model lineup with enhanced security protocols.",
                      features: ["Biometric Auth", "Social Login", "Instant Access", "Security Protocols"],
                      gradient: "from-blue-500 via-blue-600 to-indigo-600",
                      bgGradient: "from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20",
                      borderColor: "border-blue-500/30"
                    },
                    {
                      icon: <Key className="h-7 w-7" />,
                      title: "Connect Your AI",
                      step: "02",
                      description: "Seamlessly integrate with your existing AI provider accounts or use our built-in models. Enhanced with quantum-resistant encryption and real-time security monitoring.",
                      features: ["API Integration", "Built-in Models", "Quantum Encryption", "Real-time Monitoring"],
                      gradient: "from-emerald-500 via-teal-600 to-cyan-600",
                      bgGradient: "from-emerald-50/50 to-cyan-50/50 dark:from-emerald-900/20 dark:to-cyan-900/20",
                      borderColor: "border-emerald-500/30"
                    },
                    {
                      icon: <MessageSquare className="h-7 w-7" />,
                      title: "Start Collaborating",
                      step: "03",
                      description: "Experience context-aware AI conversations with advanced memory systems. Your interactions are automatically analyzed and optimized for better responses over time.",
                      features: ["Context Awareness", "Memory Systems", "Auto Optimization", "Smart Responses"],
                      gradient: "from-violet-500 via-purple-600 to-pink-600",
                      bgGradient: "from-violet-50/50 to-pink-50/50 dark:from-violet-900/20 dark:to-pink-900/20",
                      borderColor: "border-violet-500/30"
                    }
                  ].map((step, index) => (
                    <motion.div 
                      key={step.title}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      className="relative group"
                    >
                      {/* Step number indicator */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
                          "bg-gradient-to-br text-white font-bold text-lg",
                          "group-hover:scale-110 group-hover:shadow-2xl",
                          step.gradient
                        )}>
                          {step.step}
                        </div>
                      </div>

                      <Card className={cn(
                        "relative overflow-hidden transition-all duration-500 pt-8",
                        "hover:shadow-2xl hover:-translate-y-2",
                        "glass-enhanced border-2",
                        step.borderColor,
                        "h-full"
                      )}>
                        {/* Background gradient */}
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                          step.bgGradient
                        )}></div>
                        
                        {/* Animated border */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                        
                        <CardHeader className="relative z-10 text-center pb-4">
                          <div className={cn(
                            "mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-6 transition-all duration-300",
                            "bg-gradient-to-br text-white",
                            "group-hover:scale-110 group-hover:rotate-3",
                            step.gradient
                          )}>
                            {step.icon}
                          </div>
                          
                          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {step.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="relative z-10 space-y-6">
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                            {step.description}
                          </p>
                          
                          {/* Feature list */}
                          <div className="grid grid-cols-2 gap-3">
                            {step.features.map((feature, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                                className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                              >
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                        
                        <CardFooter className="relative z-10 pt-6">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300"
                          >
                            {index === 0 ? "Get Started" : index === 1 ? "Connect Now" : "Start Chatting"}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Call to action */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mt-16"
              >
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Ready to experience the future of AI collaboration?
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Start Your Journey
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Enhanced CTA Section */}
          <section className="relative py-20 sm:py-32 overflow-hidden">
            {/* Enhanced background with multiple layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/50 dark:to-indigo-950/30"></div>
            
            {/* Animated background orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 via-indigo-400/10 to-purple-400/15 rounded-full blur-3xl animate-float-slow"></div>
              <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/12 via-teal-400/8 to-cyan-400/12 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-400/8 via-purple-400/5 to-pink-400/8 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
            </div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-slate-100/20 dark:bg-grid-white/[0.01] [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>
            
            {/* Gradient borders */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 dark:via-blue-400/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 dark:via-purple-400/40 to-transparent"></div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                {/* Enhanced badge */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full glass-enhanced border border-blue-200/60 dark:border-blue-500/30 shadow-xl shadow-blue-100/50 dark:shadow-blue-900/30 overflow-hidden group hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 -z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/40 to-transparent dark:via-blue-400/15 -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-700"></div>
                  <span className="relative flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-md">
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  </span>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-200 tracking-wide">🚀 2025 Edition Now Available</span>
                </motion.div>

                {/* Enhanced heading */}
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight"
                >
                  Experience the Future
                  <span className="block mt-2">of AI Today</span>
                </motion.h2>

                {/* Enhanced description */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mx-auto max-w-3xl text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12"
                >
                  Join thousands of developers and businesses leveraging{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">quantum-secure AI models</span> with{' '}
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">enhanced context awareness</span>. 
                  Build smarter, more secure applications for the future.
                </motion.p>

                {/* Enhanced buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                >
                  <Button 
                    size="lg" 
                    className="relative w-full sm:w-auto group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-14 px-8 rounded-full overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center">
                      <span className="font-semibold text-lg">Start Your AI Journey</span>
                      <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="relative w-full sm:w-auto group glass-enhanced hover:bg-blue-50/80 dark:hover:bg-blue-900/30 h-14 px-8 rounded-full border-2 border-blue-200/60 dark:border-blue-500/40 hover:border-blue-400/80 dark:hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                  >
                    <div className="relative flex items-center">
                      <span className="font-semibold text-lg text-blue-700 dark:text-blue-200">Create Free Account</span>
                      <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                </motion.div>

                {/* Enhanced trust indicators */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-12"
                >
                  {[
                    { text: "No credit card required", icon: <CreditCard className="w-5 h-5" />, color: "text-emerald-600 dark:text-emerald-400" },
                    { text: "Free tier available", icon: <Zap className="w-5 h-5" />, color: "text-blue-600 dark:text-blue-400" },
                    { text: "Cancel anytime", icon: <CheckCircle className="w-5 h-5" />, color: "text-violet-600 dark:text-violet-400" }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:scale-105 transition-transform duration-200"
                    >
                      <span className={item.color}>{item.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Stats section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
                >
                  {[
                    { number: "10K+", label: "Active Users", icon: <User className="w-6 h-6" /> },
                    { number: "99.9%", label: "Uptime", icon: <Shield className="w-6 h-6" /> },
                    { number: "24/7", label: "Support", icon: <MessageSquare className="w-6 h-6" /> }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.number}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Modern Footer */}
          <ModernFooter />
        </motion.div>
      ) : (
        <div className="w-full max-w-5xl mx-auto h-full p-2 md:p-4">
          <Chat />
        </div>
      )}
    <BackToTop />
    </div>
  );
}

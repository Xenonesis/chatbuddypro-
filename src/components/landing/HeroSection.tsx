'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, ArrowRight, User, ChevronDown, Bot } from 'lucide-react';
import Link from 'next/link';
import { MotionButton } from '@/components/ui/motion-button';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartChat: () => void;
  onScrollToFeatures: () => void;
  onScrollToHowItWorks: () => void;
  showSignup?: boolean;
}

export function HeroSection({ 
  onStartChat, 
  onScrollToFeatures, 
  onScrollToHowItWorks, 
  showSignup = true 
}: HeroSectionProps) {
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-slate-900 dark:via-[#0f172a] dark:to-[#0c1222] py-12 sm:py-20 md:py-28 lg:py-32">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute h-full w-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 via-cyan-300/15 to-indigo-400/20 dark:from-blue-500/30 dark:via-cyan-400/20 dark:to-indigo-500/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/15 via-pink-300/10 to-violet-400/15 dark:from-purple-500/25 dark:via-pink-400/15 dark:to-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/10 via-teal-300/8 to-cyan-400/12 dark:from-emerald-500/20 dark:via-teal-400/12 dark:to-cyan-500/18 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Border gradients */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 dark:via-blue-400/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/60 dark:via-purple-400/40 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
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
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">context-aware responses</span>, and seamless integration with the latest 2025 AI models.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <MotionButton 
                onClick={onStartChat}
                size="lg"
                animationType="scale"
                className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 dark:shadow-blue-500/30 border-0 h-14 px-10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 focus:ring-offset-2 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  <MessageSquare className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-semibold text-base">Start Chatting Now</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </MotionButton>

              {showSignup && (
                <Link href="/auth/signup" className="sm:w-auto w-full">
                  <MotionButton 
                    variant="outline" 
                    size="lg"
                    animationType="lift"
                    className="relative glass-light dark:glass-dark text-blue-700 dark:text-blue-100 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 h-14 px-10 rounded-full backdrop-blur-sm transition-all duration-300 hover:border-blue-400/60 dark:hover:border-blue-400/60 w-full focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700 focus:ring-offset-2 group border-2 border-blue-200/60 dark:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="relative flex items-center justify-center">
                      <User className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-semibold text-base">Create Free Account</span>
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
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
                onClick={onScrollToFeatures}
                className="flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl px-4 py-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm"
              >
                <span className="mr-2 group-hover:underline font-medium">🚀 Explore 2025 Features</span>
                <ChevronDown className="h-4 w-4 animate-bounce group-hover:translate-y-1 transition-transform duration-200" />
              </button>
              <button
                type="button"
                onClick={onScrollToHowItWorks}
                className="flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl px-4 py-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm"
              >
                <span className="mr-2 group-hover:underline font-medium">⚡ See How It Works</span>
                <ChevronDown className="h-4 w-4 animate-bounce group-hover:translate-y-1 transition-transform duration-200" />
              </button>
            </motion.div>
          </motion.div>

          {/* Chat Demo Window */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:block h-[400px] sm:h-[500px]"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90 backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-sm flex items-center px-6 border-b border-slate-700/50">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 shadow-sm"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-sm"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm"></div>
                </div>
                <div className="mx-auto flex items-center text-sm text-slate-300 font-medium">
                  <Bot className="h-5 w-5 mr-2 text-blue-400 animate-pulse" />
                  ChatBuddy 2025 - AI Assistant
                </div>
              </div>
              
              <div className="pt-14 p-6 h-full">
                <div className="flex flex-col h-full overflow-hidden space-y-4">
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
                        <p className="text-sm leading-relaxed">
                          🚀 We've added <span className="text-cyan-300 font-semibold">quantum-secure encryption</span>, <span className="text-green-300 font-semibold">context-aware AI responses</span>, and integration with the latest 2025 AI models! ✨
                        </p>
                        <span className="text-xs text-slate-400 mt-2 block">Powered by Advanced AI • Just now</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="rgb(241 245 249)" fillOpacity="0.03" d="M0,192L48,170.7C96,149,192,107,288,112C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,101.3C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}

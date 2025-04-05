'use client';

import { useState, useEffect, useRef } from 'react';
import Chat from '@/components/Chat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MotionButton } from '@/components/ui/motion-button';
import { MessageSquare, Sparkles, Bot, Shield, Database, Key, ArrowRight, User, Zap, ChevronDown, Brain, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import ResponsiveContainer, { ResponsiveSection } from '@/components/Layout/ResponsiveContainer';
import { EnhancedTooltip } from '@/components/ui/enhanced-tooltip';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  }, [user, router]);

  const handleStartChat = () => {
    setShowWelcome(false);
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
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    },
  };

  return (
    <div className="flex-1 flex flex-col items-center min-h-[calc(100vh-64px)]">
      {showWelcome ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full mx-auto space-y-20 pb-8"
        >
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0c1222] py-16 sm:py-24 md:py-32 text-white">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]"></div>
            <div className="absolute h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.15),transparent_50%)]"></div>
            <div className="absolute h-full w-full bg-[radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.15),transparent_50%)]"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <motion.div 
                  variants={itemVariants} 
                  className="space-y-8"
                >
                  <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent mb-4">
                      ChatBuddy
            </h1>
                    <p className="text-2xl sm:text-3xl font-semibold text-white">
                      Your Personal AI Assistant with Superpowers
                    </p>
                  </div>
                  <p className="text-lg sm:text-xl text-blue-100 max-w-lg">
                    Connect with multiple AI models, store your chats securely, and customize your experience - all from one beautiful interface.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <MotionButton 
                      onClick={handleStartChat}
                      size="lg"
                      animationType="scale"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg border-0 h-12 px-6 rounded-full"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Start Chatting Now
                    </MotionButton>
                    {!user && (
                      <Link href="/auth/signup">
                        <MotionButton 
                          variant="outline" 
                          size="lg"
                          animationType="lift"
                          className="border-blue-400 text-blue-100 hover:bg-blue-900/20 h-12 px-6 rounded-full"
                        >
                          <User className="mr-2 h-5 w-5" />
                          Create Account
                        </MotionButton>
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={scrollToFeatures}
                      className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                    >
                      <span className="mr-2">See Features</span>
                      <ChevronDown className="h-4 w-4 animate-bounce" />
                    </button>
                    <button 
                      onClick={scrollToHowItWorks}
                      className="flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                    >
                      <span className="mr-2">How It Works</span>
                      <ChevronDown className="h-4 w-4 animate-bounce" />
                    </button>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants} 
                  className="relative hidden md:block h-[450px]"
                >
                  <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800/80 backdrop-blur-sm">
                    <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900/90 backdrop-blur-sm flex items-center px-4">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="mx-auto flex items-center text-sm text-slate-400">
                        <Brain className="h-4 w-4 mr-2 text-blue-400" />
                        ChatBuddy
                      </div>
                    </div>
                    <div className="absolute top-12 bottom-0 left-0 right-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.3),transparent)]"></div>
                    <div className="pt-12 p-4 h-full">
                      <div className="flex flex-col h-full overflow-hidden">
                        <div className="bg-slate-700/50 p-4 rounded-lg mb-3 text-white backdrop-blur-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm shadow-md">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm">How can you help me with my tasks?</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-4 rounded-lg mb-3 text-white backdrop-blur-sm shadow-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm shadow-md">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm">I can assist with writing, research, answering questions, creative brainstorming, and more. What specific task would you like help with today?</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1"></div>
                        <div className="border-t border-slate-700/50 pt-3">
                          <div className="bg-slate-700/30 rounded-full flex items-center p-2 shadow-inner backdrop-blur-sm">
                            <input 
                              type="text" 
                              className="bg-transparent border-0 text-white text-sm flex-1 focus:outline-none px-2" 
                              placeholder="Type your message..." 
                              disabled 
                            />
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-transparent">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decoration elements */}
                  <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl"></div>
                </motion.div>
              </div>

              <motion.div 
                variants={itemVariants}
                className="mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-6"
              >
                <EnhancedTooltip 
                  content="Chat with OpenAI, Claude, Gemini and more" 
                  side="top"
                >
                  <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/70 to-slate-700/50 px-4 py-2 rounded-full text-sm shadow-md backdrop-blur-sm">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Multiple AI Models</span>
                  </div>
                </EnhancedTooltip>
                
                <EnhancedTooltip 
                  content="Your data is protected with secure authentication" 
                  side="top"
                >
                  <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/70 to-slate-700/50 px-4 py-2 rounded-full text-sm shadow-md backdrop-blur-sm">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    <span>Secure Authentication</span>
                  </div>
                </EnhancedTooltip>
                
                <EnhancedTooltip 
                  content="Save and access your past conversations" 
                  side="top"
                >
                  <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/70 to-slate-700/50 px-4 py-2 rounded-full text-sm shadow-md backdrop-blur-sm">
                    <Database className="h-4 w-4 text-cyan-400" />
                    <span>Chat History</span>
                  </div>
                </EnhancedTooltip>
                
                <EnhancedTooltip 
                  content="Securely store your API keys" 
                  side="top"
                >
                  <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/70 to-slate-700/50 px-4 py-2 rounded-full text-sm shadow-md backdrop-blur-sm">
                    <Key className="h-4 w-4 text-cyan-400" />
                    <span>API Key Management</span>
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

          {/* Features Section */}
          <div ref={featuresRef}>
            <ResponsiveSection 
              title="Powerful Features" 
              subtitle="Designed to enhance your AI conversation experience"
              className="px-4 sm:px-6 lg:px-8"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {[
                  {
                    icon: <Bot className="h-5 w-5 text-white" />,
                    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
                    title: "Multi-Model Support",
                    description: "Chat with OpenAI, Google Gemini, Anthropic Claude, and Mistral models all from a single interface.",
                    borderColor: "border-blue-500",
                    shadowColor: "shadow-blue-500/10",
                    footer: "OpenAI • Gemini • Claude • Mistral",
                    gradientFrom: "from-blue-50",
                    gradientTo: "to-slate-50"
                  },
                  {
                    icon: <Shield className="h-5 w-5 text-white" />,
                    iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
                    title: "Secure Storage",
                    description: "Your chat history, preferences, and API keys are securely stored and encrypted using Supabase authentication.",
                    borderColor: "border-indigo-500",
                    shadowColor: "shadow-indigo-500/10",
                    footer: "Encryption • Authentication • Data Privacy",
                    gradientFrom: "from-indigo-50",
                    gradientTo: "to-slate-50"
                  },
                  {
                    icon: <Zap className="h-5 w-5 text-white" />,
                    iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
                    title: "Personalization",
                    description: "Customize your profile, preferences, and chat settings to create a personalized AI assistant experience.",
                    borderColor: "border-violet-500",
                    shadowColor: "shadow-violet-500/10",
                    footer: "User Profiles • Preferences • Themes",
                    gradientFrom: "from-violet-50",
                    gradientTo: "to-slate-50"
                  }
                ].map((feature, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className={cn(
                      "border border-slate-200 dark:border-slate-800",
                      "overflow-hidden group transition-all duration-300",
                      "hover:shadow-xl dark:hover:shadow-slate-800/30",
                      "hover:-translate-y-1",
                      "dark:bg-slate-800/50 h-full",
                      feature.shadowColor
                    )}>
                      <div className={cn(
                        "absolute h-1 top-0 left-0 right-0",
                        `bg-${feature.borderColor}`
                      )}></div>
                      <div className="absolute inset-0 bg-gradient-to-b dark:from-slate-800/0 dark:via-slate-800/0 dark:to-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 bg-gradient-to-br dark:from-slate-800/0 dark:to-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-gradient-to-br dark:from-white/5 dark:to-white/0 from-blue-50 to-transparent group-hover:from-blue-100/10 transition-colors"></div>
                      
              <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full shadow-lg",
                            feature.iconBg
                          )}>
                            {feature.icon}
                          </div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                        </div>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          {feature.title === "Secure Storage" ? 
                            "User data protected with Supabase" : 
                            feature.title === "Personalization" ? 
                              "Tailor your experience" : 
                              "Access to various AI models in one place"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                        <p className="text-slate-700 dark:text-slate-300">
                          {feature.description}
                        </p>
              </CardContent>
                      <CardFooter className="border-t border-slate-100 dark:border-slate-800/50 pt-4 mt-auto">
                        <div className="flex items-center w-full justify-between">
                          <p className="text-xs text-slate-500">{feature.footer}</p>
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            "bg-slate-100 dark:bg-slate-800",
                            "text-slate-500 dark:text-slate-400",
                            "group-hover:bg-green-100 group-hover:text-green-600",
                            "dark:group-hover:bg-green-900/20 dark:group-hover:text-green-400",
                            "transition-colors"
                          )}>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        </div>
                      </CardFooter>
            </Card>
                  </motion.div>
                ))}
              </motion.div>
            </ResponsiveSection>
          </div>

          {/* How It Works Section */}
          <section ref={howItWorksRef} className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 py-16 sm:py-24">
            <ResponsiveContainer maxWidth="xl" padding="lg">
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4"
                >
                  How It Works
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
                >
                  Get started in just a few simple steps
                </motion.p>
              </div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
              >
                {[
                  {
                    icon: <User className="h-6 w-6" />,
                    title: "1. Create an Account",
                    description: "Sign up for a free account to access all features and save your chat history.",
                    gradient: "from-blue-600 to-indigo-600"
                  },
                  {
                    icon: <Key className="h-6 w-6" />,
                    title: "2. Add Your API Keys",
                    description: "Connect your preferred AI services by adding your API keys securely.",
                    gradient: "from-indigo-600 to-violet-600"
                  },
                  {
                    icon: <MessageSquare className="h-6 w-6" />,
                    title: "3. Start Chatting",
                    description: "Begin your conversation with your preferred AI model and save your chats automatically.",
                    gradient: "from-violet-600 to-purple-600"
                  }
                ].map((step, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants} 
                    className="flex flex-col items-center text-center group"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="relative mb-8">
                      <div 
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r blur-xl opacity-30 group-hover:opacity-70 transition-opacity" 
                        style={{
                          backgroundImage: 'linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(139, 92, 246, 0.2))'
                        }}
                      ></div>
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </ResponsiveContainer>
          </section>

          {/* CTA Section */}
          <section className="w-full py-16 sm:py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]"></div>
            
            <ResponsiveContainer maxWidth="xl" padding="md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="text-center relative z-10"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Ready to Start Chatting?</h2>
                <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                  Experience the power of multiple AI models, secure storage, and customization all in one place.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  <MotionButton 
              onClick={handleStartChat}
              size="lg"
                    animationType="bounce"
                    className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 rounded-full shadow-md hover:shadow-lg"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chatting Now
                  </MotionButton>
                  {!user && (
                    <Link href="/auth/signup">
                      <MotionButton 
                        variant="outline" 
                        size="lg"
                        animationType="scale"
                        className="border-white text-white hover:bg-white/10 h-12 px-8 rounded-full backdrop-blur-sm shadow-md hover:shadow-lg"
                      >
                        <User className="mr-2 h-5 w-5" />
                        Create Account
                      </MotionButton>
                    </Link>
                  )}
                </div>
              </motion.div>
            </ResponsiveContainer>
          </section>

          {/* Footer */}
          <footer className="w-full py-10 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center text-slate-900 dark:text-white">
                  <Bot className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium">ChatBuddy</span>
                </div>
                
                <div className="flex gap-6 text-sm">
                  <Link href="/settings" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Settings</Link>
                  <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Privacy</Link>
                  <Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Terms</Link>
          </div>

                <div className="text-sm text-slate-500 dark:text-slate-500">
                  © 2023 ChatBuddy
                </div>
          </div>
        </div>
          </footer>
        </motion.div>
      ) : (
        <div className="w-full max-w-5xl mx-auto h-full p-2 md:p-4">
          <Chat />
        </div>
      )}
    </div>
  );
}

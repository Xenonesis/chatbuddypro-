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
          animate={mounted ? "visible" : "hidden"} 
          variants={containerVariants}
          className="w-full mx-auto space-y-20 pb-8"
        >
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:via-[#0f172a] dark:to-[#0c1222] py-20 sm:py-28 md:py-32">
            {/* Enhanced Background elements */}
            <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-white/5 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1))]"></div>
            <div className="absolute h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.15),transparent_50%)]"></div>
            <div className="absolute h-full w-full bg-[radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.15),transparent_50%)]"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-blue-500/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-purple-500/30 to-transparent"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <motion.div 
                  variants={itemVariants} 
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-light dark:glass-dark border border-blue-200/80 dark:border-blue-500/30 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20 overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-blue-500/10 -z-10"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent dark:via-blue-400/10 -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-700 animate-pulse"></div>
                      <span className="relative flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-500/30 rounded-full">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
                      </span>
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">New for 2025: Enhanced AI Models & Security</span>
                    </motion.div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                      <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400 bg-clip-text text-transparent">ChatBuddy</span>
                      <span className="block text-3xl sm:text-4xl md:text-5xl mt-4 text-slate-800 dark:text-white/90">Your AI Assistant for 2025 & Beyond</span>
                    </h1>
                  </div>
                  <p className="text-lg sm:text-xl text-slate-600 dark:text-blue-100/90 max-w-xl leading-relaxed">
                    Experience the next evolution of AI with quantum-secure encryption, context-aware responses, and seamless integration with the latest 2025 AI models - all in one beautiful interface.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 button-stack">
                    <MotionButton 
                      onClick={handleStartChat}
                      size="lg"
                      animationType="scale"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg dark:shadow-blue-500/20 border-0 h-12 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Start Chatting Now
                    </MotionButton>
                    {!user && (
                      <Link href="/auth/signup" className="sm:w-auto w-full">
                        <MotionButton 
                          variant="outline" 
                          size="lg"
                          animationType="lift"
                          className="glass-light dark:glass-dark text-blue-700 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-12 px-8 rounded-full backdrop-blur-sm transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-400/50 w-full"
                        >
                          <User className="mr-2 h-5 w-5" />
                          Create Free Account
                        </MotionButton>
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-6 pt-4">
                    <button 
                      onClick={scrollToFeatures}
                      className="flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors group"
                    >
                      <span className="mr-2 group-hover:underline">Explore 2025 Features</span>
                      <ChevronDown className="h-4 w-4 animate-bounce" />
                    </button>
                    <button 
                      onClick={scrollToHowItWorks}
                      className="flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 transition-colors group"
                    >
                      <span className="mr-2 group-hover:underline">See How It Works</span>
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
                        ChatBuddy 2025
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
                              <p className="text-sm">What's new in ChatBuddy for 2025?</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-4 rounded-lg mb-3 text-white backdrop-blur-sm shadow-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm shadow-md">
                              <Bot className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm">We've added quantum-secure encryption, context-aware AI responses, and integration with the latest 2025 AI models including GPT-5 and Claude 3. Plus, our UI is now more intuitive than ever!</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1"></div>
                        <div className="border-t border-slate-700/50 pt-3">
                          <div className="glass-dark rounded-full flex items-center p-2 shadow-inner backdrop-blur-sm">
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
                  {/* Enhanced decoration elements */}
                  <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl"></div>
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 right-0 w-24 h-24 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-xl"></div>
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
              title="2025 Features" 
              subtitle="Experience the next generation of AI collaboration"
              className="px-4 sm:px-6 lg:px-8"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 feature-grid"
              >
                {[
                  {
                    icon: <Bot className="h-5 w-5 text-white" />,
                    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
                    title: "Advanced AI Models",
                    description: "Access the latest 2025 AI models including GPT-5, Claude 3, and Gemini Pro. Experience enhanced reasoning, creativity, and technical capabilities.",
                    borderColor: "border-blue-500",
                    shadowColor: "shadow-blue-500/10 dark:shadow-blue-500/20",
                    footer: "GPT-5 • Claude 3 • Gemini Pro • Mistral",
                    gradientFrom: "from-blue-50",
                    gradientTo: "to-slate-50"
                  },
                  {
                    icon: <Shield className="h-5 w-5 text-white" />,
                    iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
                    title: "Quantum-Secure Encryption",
                    description: "Future-proof security with quantum-resistant encryption. Your data is protected against next-gen threats with advanced authentication and monitoring.",
                    borderColor: "border-indigo-500",
                    shadowColor: "shadow-indigo-500/10 dark:shadow-indigo-500/20",
                    footer: "Post-Quantum • Zero Trust • SOC 2 Type II",
                    gradientFrom: "from-indigo-50",
                    gradientTo: "to-slate-50"
                  },
                  {
                    icon: <Brain className="h-5 w-5 text-white" />,
                    iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
                    title: "Context-Aware AI",
                    description: "Experience truly intelligent conversations with our context-aware AI. Understands your workflow, remembers past interactions, and provides personalized responses.",
                    borderColor: "border-violet-500",
                    shadowColor: "shadow-violet-500/10 dark:shadow-violet-500/20",
                    footer: "Memory System • Workflow Aware • Personalized",
                    gradientFrom: "from-violet-50",
                    gradientTo: "to-slate-50"
                  }
                ].map((feature, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className={cn(
                      "border border-slate-200/50 dark:border-slate-800/50",
                      "overflow-hidden group transition-all duration-300",
                      "hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10",
                      "hover:-translate-y-2",
                      "glass-light dark:glass-dark",
                      "relative",
                      feature.shadowColor
                    )}>
                      <div className={cn(
                        "absolute h-[2px] top-0 left-0 right-0 opacity-50 group-hover:opacity-100 transition-opacity",
                        `bg-gradient-to-r from-transparent via-${feature.borderColor} to-transparent`
                      )}></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-white/0 dark:from-slate-800/30 dark:via-slate-800/20 dark:to-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/0 dark:from-slate-800/20 dark:to-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-500/10 dark:to-transparent group-hover:from-blue-100/20 dark:group-hover:from-blue-500/20 transition-colors"></div>
                      
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-transform group-hover:scale-110",
                            "group-hover:shadow-blue-500/25 dark:group-hover:shadow-blue-500/40",
                            feature.iconBg
                          )}>
                            {feature.icon}
                          </div>
                          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</CardTitle>
                        </div>
                        <CardDescription className="text-slate-600 dark:text-slate-300 text-base">
                          {feature.title === "Quantum-Secure Encryption" ? 
                            "Next-gen security for your data" : 
                            feature.title === "Context-Aware AI" ? 
                              "Intelligent conversation flow" : 
                              "Latest AI model access"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                      <CardFooter className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4 mt-auto">
                        <div className="flex items-center w-full justify-between">
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{feature.footer}</p>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            "glass-light dark:glass-dark",
                            "text-slate-600 dark:text-slate-300",
                            "group-hover:bg-green-50 group-hover:text-green-600",
                            "dark:group-hover:bg-green-900/20 dark:group-hover:text-green-400",
                            "transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm"
                          )}>
                            <CheckCircle className="w-5 h-5" />
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
          <section className="relative py-20 sm:py-28 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-[#0c1222]"></div>
            <div className="absolute inset-0 bg-[url('/grid-light.svg')] dark:bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            
            <div className="relative container">
              <div className="mx-auto max-w-2xl sm:text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                  Get started in minutes with our streamlined 2025 setup process. Experience quantum-secure authentication and instant access to next-gen AI models.
                </p>
              </div>

              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3 feature-grid">
                {[
                  {
                    icon: <User className="h-6 w-6" />,
                    title: "1. Create an Account",
                    description: "Sign up instantly with biometric authentication or quantum-secure social login. Get immediate access to our 2025 AI model lineup with enhanced security protocols.",
                    gradient: "from-blue-600 to-indigo-600"
                  },
                  {
                    icon: <Key className="h-6 w-6" />,
                    title: "2. Connect Your AI",
                    description: "Seamlessly integrate with your existing AI provider accounts or use our built-in models. Enhanced with quantum-resistant encryption and real-time security monitoring.",
                    gradient: "from-indigo-600 to-violet-600"
                  },
                  {
                    icon: <MessageSquare className="h-6 w-6" />,
                    title: "3. Start Collaborating",
                    description: "Experience context-aware AI conversations with advanced memory systems. Your interactions are automatically analyzed and optimized for better responses over time.",
                    gradient: "from-violet-600 to-purple-600"
                  }
                ].map((step, index) => (
                  <div key={step.title} className={cn(
                    "group relative",
                    "rounded-2xl p-6",
                    "glass-light dark:glass-dark",
                    "border border-slate-200/50 dark:border-slate-800/50",
                    "hover:bg-white/80 dark:hover:bg-slate-800/80",
                    "transition-all duration-300",
                    "hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10"
                  )}>
                    <div className="absolute -inset-px rounded-2xl border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors"></div>
                    
                    <div className={cn(
                      "relative flex h-20 w-20 items-center justify-center rounded-xl",
                      "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-900/20",
                      "shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20",
                      "group-hover:shadow-blue-500/20 dark:group-hover:shadow-blue-500/30",
                      "transition-all duration-300 group-hover:scale-110"
                    )}>
                      <div className="flex items-center justify-center w-12 h-12 text-blue-600/90 dark:text-blue-400">
                        {step.icon}
                      </div>
                    </div>

                    <h3 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="absolute bottom-6 right-6">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        "glass-light dark:glass-dark",
                        "text-slate-600 dark:text-slate-300",
                        "group-hover:bg-blue-50 group-hover:text-blue-600",
                        "dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-400",
                        "transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm"
                      )}>
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-20 sm:py-28 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-[#0c1222]"></div>
            <div className="absolute inset-0 bg-[url('/grid-light.svg')] dark:bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            
            <div className="absolute w-[600px] h-[600px] -right-64 top-1/2 -translate-y-1/2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/50 to-transparent dark:from-blue-500/10 dark:via-blue-400/5 dark:to-transparent opacity-60 dark:opacity-30 blur-3xl"></div>
            </div>
            <div className="absolute w-[600px] h-[600px] -left-64 top-1/2 -translate-y-1/2 rotate-180">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-purple-100/50 to-transparent dark:from-purple-500/10 dark:via-purple-400/5 dark:to-transparent opacity-60 dark:opacity-30 blur-3xl"></div>
            </div>

            <div className="relative container">
              <div className="mx-auto max-w-4xl text-center">
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full glass-light dark:glass-dark border border-blue-200/80 dark:border-blue-500/30 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-blue-500/10 -z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent dark:via-blue-400/10 -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-700 animate-pulse"></div>
                  <span className="relative flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-500/30 rounded-full">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
                  </span>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">2025 Edition Now Available</span>
                </motion.div>

                <h2 className="mb-6 text-4xl sm:text-5xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  Experience the Future of AI Today
                </h2>

                <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                  Join thousands of developers leveraging quantum-secure AI models with enhanced context awareness. Build smarter, more secure applications in 2025.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 button-stack">
                  <Button size="lg" className="w-full sm:w-auto group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg dark:shadow-blue-500/20">
                    Start Your AI Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto group glass-light dark:glass-dark hover:bg-white/80 dark:hover:bg-slate-800/80">
                    Create Free Account
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                  {[
                    { text: "No credit card required", icon: <CreditCard className="w-4 h-4" /> },
                    { text: "Free tier available", icon: <Zap className="w-4 h-4" /> },
                    { text: "Cancel anytime", icon: <CheckCircle className="w-4 h-4" /> }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-green-600 dark:text-green-400">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                  <Link href="/settings" className="text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Settings</Link>
                  <Link href="/privacy" className="text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Privacy</Link>
                  <Link href="/terms" className="text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Terms</Link>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  © 2025 ChatBuddy
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

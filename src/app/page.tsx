'use client';

import { useState, useEffect, useRef } from 'react';
import Chat from '@/components/Chat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { HeroSection, FAQSection, PartnersSection } from '@/components/landing';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles, Bot, Shield, Key, ArrowRight, User, Zap, Brain, CheckCircle, ChevronRight, CreditCard, Star, Globe, Clock, Smartphone, Monitor, Tablet, Users, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import BackToTop from '@/components/BackToTop';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ModernFooter } from '@/components/ui-custom/ModernFooter';
import { EnhancedLandingPage } from '@/components/ui-custom/EnhancedLandingPage';

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
          <HeroSection 
            onStartChat={handleStartChat}
            onScrollToFeatures={scrollToFeatures}
            onScrollToHowItWorks={scrollToHowItWorks}
            showSignup={!user}
          />

          {/* Partners & Integrations */}
          <PartnersSection />


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

          {/* Enhanced Stats & Social Proof Section */}
          <section className="relative py-16 sm:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Trusted by Developers Worldwide
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                  Join thousands of developers, startups, and enterprises who trust ChatBuddy for their AI needs
                </p>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
                {[
                  { number: "50K+", label: "Active Users", icon: <Users className="w-8 h-8" />, color: "from-blue-500 to-indigo-600" },
                  { number: "99.9%", label: "Uptime", icon: <TrendingUp className="w-8 h-8" />, color: "from-emerald-500 to-teal-600" },
                  { number: "1M+", label: "Messages Processed", icon: <MessageSquare className="w-8 h-8" />, color: "from-violet-500 to-purple-600" },
                  { number: "24/7", label: "Support", icon: <Clock className="w-8 h-8" />, color: "from-orange-500 to-red-600" }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center group"
                  >
                    <div className={cn(
                      "flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl text-white shadow-xl group-hover:scale-110 transition-all duration-300",
                      `bg-gradient-to-br ${stat.color}`
                    )}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.number}</div>
                    <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Testimonials */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {[
                  {
                    quote: "ChatBuddy has revolutionized how our team collaborates with AI. The security features give us peace of mind.",
                    author: "Sarah Chen",
                    role: "CTO, TechCorp",
                    avatar: "SC",
                    rating: 5
                  },
                  {
                    quote: "The context-aware responses are incredible. It's like having a team member who never forgets anything.",
                    author: "Marcus Rodriguez",
                    role: "Lead Developer, StartupXYZ",
                    avatar: "MR",
                    rating: 5
                  },
                  {
                    quote: "Best AI platform we've used. The 2025 features are game-changing for our workflow.",
                    author: "Emily Johnson",
                    role: "Product Manager, InnovateLab",
                    avatar: "EJ",
                    rating: 5
                  }
                ].map((testimonial, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <Card className="h-full glass-enhanced border-2 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold mr-4">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Enhanced Device Compatibility Section */}
          <section className="relative py-16 sm:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border border-green-200/50 dark:border-green-500/20"
                >
                  <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Universal Access</span>
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-green-800 to-emerald-900 dark:from-white dark:via-green-200 dark:to-emerald-200 bg-clip-text text-transparent">
                  Works Everywhere You Do
                </h2>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                  Seamlessly access ChatBuddy across all your devices with our responsive design and progressive web app technology
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Device showcase */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="grid grid-cols-3 gap-4 items-end">
                    {/* Mobile */}
                    <div className="relative group">
                      <div className="w-full aspect-[9/16] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-1 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden">
                          <div className="h-6 bg-slate-900 dark:bg-slate-800 flex items-center justify-center">
                            <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
                          </div>
                          <div className="p-2 space-y-2">
                            <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded"></div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                          <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Mobile</span>
                        </div>
                      </div>
                    </div>

                    {/* Tablet */}
                    <div className="relative group">
                      <div className="w-full aspect-[4/3] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-1 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden">
                          <div className="p-3 space-y-2">
                            <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded"></div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                          <Tablet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tablet</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="relative group">
                      <div className="w-full aspect-[16/10] bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-1 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden">
                          <div className="h-4 bg-slate-900 dark:bg-slate-800 flex items-center px-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                          </div>
                          <div className="p-2 space-y-1">
                            <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded"></div>
                            <div className="grid grid-cols-3 gap-1">
                              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                          <Monitor className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Desktop</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Features list */}
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-8"
                >
                  {[
                    {
                      icon: <Smartphone className="w-6 h-6" />,
                      title: "Mobile Optimized",
                      description: "Native-like experience on iOS and Android with touch-optimized interface and offline capabilities"
                    },
                    {
                      icon: <Monitor className="w-6 h-6" />,
                      title: "Desktop Powerhouse",
                      description: "Full-featured desktop experience with keyboard shortcuts, multi-window support, and advanced workflows"
                    },
                    {
                      icon: <Globe className="w-6 h-6" />,
                      title: "Progressive Web App",
                      description: "Install directly from your browser, works offline, and receives automatic updates"
                    },
                    {
                      icon: <Zap className="w-6 h-6" />,
                      title: "Lightning Fast",
                      description: "Optimized performance across all devices with intelligent caching and preloading"
                    }
                  ].map((feature, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-4 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Enhanced Landing Page Components */}
          <EnhancedLandingPage />

          {/* Pricing Section */}
          <section className="relative py-16 sm:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border border-purple-200/50 dark:border-purple-500/20"
                >
                  <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Simple Pricing</span>
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-purple-800 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                  Choose Your Plan
                  <span className="block mt-2 text-2xl sm:text-3xl lg:text-4xl">Start Free, Scale as You Grow</span>
                </h2>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                  Get started with our generous free tier, then upgrade to unlock advanced features and higher limits
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {[
                  {
                    name: "Free",
                    price: "$0",
                    period: "forever",
                    description: "Perfect for getting started",
                    features: [
                      "1,000 messages/month",
                      "Basic AI models",
                      "Standard support",
                      "Web access",
                      "Basic security"
                    ],
                    buttonText: "Get Started Free",
                    buttonVariant: "outline" as const,
                    popular: false,
                    gradient: "from-slate-500 to-slate-600",
                    bgGradient: "from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50"
                  },
                  {
                    name: "Pro",
                    price: "$19",
                    period: "per month",
                    description: "For professionals and teams",
                    features: [
                      "50,000 messages/month",
                      "All AI models including GPT-5",
                      "Priority support",
                      "Mobile & desktop apps",
                      "Advanced security",
                      "Context memory",
                      "Custom workflows"
                    ],
                    buttonText: "Start Pro Trial",
                    buttonVariant: "default" as const,
                    popular: true,
                    gradient: "from-blue-500 to-indigo-600",
                    bgGradient: "from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20"
                  },
                  {
                    name: "Enterprise",
                    price: "Custom",
                    period: "contact us",
                    description: "For large organizations",
                    features: [
                      "Unlimited messages",
                      "Custom AI model training",
                      "24/7 dedicated support",
                      "On-premise deployment",
                      "SOC 2 compliance",
                      "Advanced analytics",
                      "Custom integrations",
                      "SLA guarantees"
                    ],
                    buttonText: "Contact Sales",
                    buttonVariant: "outline" as const,
                    popular: false,
                    gradient: "from-purple-500 to-pink-600",
                    bgGradient: "from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20"
                  }
                ].map((plan, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative"
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <Card className={cn(
                      "h-full glass-enhanced border-2 transition-all duration-500 group",
                      plan.popular 
                        ? "border-blue-500/50 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 scale-105" 
                        : "border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl",
                      "hover:-translate-y-2"
                    )}>
                      {/* Background gradient */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg",
                        plan.bgGradient
                      )}></div>
                      
                      <CardHeader className="relative z-10 text-center pb-6">
                        <div className={cn(
                          "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 transition-all duration-300",
                          "bg-gradient-to-br group-hover:scale-110",
                          plan.gradient
                        )}>
                          <span className="text-2xl font-bold">{plan.name[0]}</span>
                        </div>
                        
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          {plan.name}
                        </CardTitle>
                        
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                          {plan.period && (
                            <span className="text-slate-600 dark:text-slate-400 ml-2">/{plan.period}</span>
                          )}
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-300">{plan.description}</p>
                      </CardHeader>
                      
                      <CardContent className="relative z-10 space-y-6">
                        <div className="space-y-3">
                          {plan.features.map((feature, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                        
                        <Button 
                          variant={plan.buttonVariant}
                          size="lg"
                          className={cn(
                            "w-full transition-all duration-300",
                            plan.popular 
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                              : "hover:scale-105"
                          )}
                        >
                          {plan.buttonText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Additional pricing info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-16 text-center"
              >
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  All plans include our core features and 30-day money-back guarantee
                </p>
                <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
                  {[
                    "30-day free trial",
                    "No setup fees",
                    "Cancel anytime",
                    "24/7 support"
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section */}
          <FAQSection />

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

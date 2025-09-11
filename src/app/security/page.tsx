'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Key, FileCheck, Users, AlertTriangle, CheckCircle, Globe, Database, Bot, Cpu, Cloud, Zap, RefreshCw, UserCheck, Layers, Network, Fingerprint, ShieldCheck, Mic, MessageSquare, Code, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveContainer from '@/components/Layout/ResponsiveContainer';
import { ModernFooter } from '@/components/ui-custom/ModernFooter';

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Key,
      title: "Client-Side API Key Encryption",
      description: "Your API keys for OpenAI, Google Gemini, Anthropic Claude, Mistral AI, Meta Llama, and DeepSeek are encrypted using AES-256 encryption with your unique user ID as salt before being stored in Supabase.",
      status: "Active",
      technical: "AES-256-GCM encryption with PBKDF2 key derivation and user-specific salting",
      category: "Data Protection",
      highlight: true
    },
    {
      icon: Database,
      title: "Supabase Row Level Security",
      description: "PostgreSQL RLS policies ensure complete data isolation. Every database query is automatically filtered by user authentication, preventing unauthorized access to any user data or chat history.",
      status: "Active",
      technical: "PostgreSQL RLS with JWT-based filtering on profiles, chat_sessions, and api_keys tables",
      category: "Access Control",
      highlight: true
    },
    {
      icon: Bot,
      title: "Direct AI Provider Connections",
      description: "Your conversations go directly from your browser to AI providers (OpenAI, Google, Anthropic, etc.). ChatBuddy never sees or stores your actual chat content - only metadata like timestamps and model selection.",
      status: "Active",
      technical: "Client-side API calls with zero server-side conversation logging",
      category: "AI Security",
      highlight: true
    },
    {
      icon: Mic,
      title: "Voice Input Privacy",
      description: "Voice input uses your browser's native Speech Recognition API. Audio is processed locally on your device and never transmitted to our servers - only the final text transcription is used.",
      status: "Active",
      technical: "Browser Web Speech API with local processing and zero audio storage",
      category: "Voice Security"
    },
    {
      icon: Lock,
      title: "Transport Layer Security",
      description: "All communications use TLS 1.3 encryption with HSTS enforcement. Your data is encrypted in transit between your browser, our servers, and AI providers.",
      status: "Active",
      technical: "TLS 1.3 with perfect forward secrecy, HSTS, and certificate pinning",
      category: "Transport Security"
    },
    {
      icon: UserCheck,
      title: "Supabase Authentication",
      description: "Secure email/password authentication with JWT tokens. Built-in support for password reset and session management with automatic token refresh.",
      status: "Active",
      technical: "JWT with RS256 signing, automatic refresh, and secure httpOnly cookies",
      category: "Authentication"
    },
    {
      icon: Eye,
      title: "Zero-Knowledge Architecture",
      description: "ChatBuddy operates on a zero-knowledge principle. We cannot access your AI conversations, decrypt your API keys, or view your personal chat content even if we wanted to.",
      status: "Active",
      technical: "Client-side encryption with server-side blind data processing",
      category: "Privacy"
    },
    {
      icon: Code,
      title: "Code Security & Syntax Highlighting",
      description: "Code blocks in your conversations are processed client-side using Prism.js for syntax highlighting. No code content is sent to our servers for processing or analysis.",
      status: "Active",
      technical: "Client-side Prism.js processing with zero server-side code analysis",
      category: "Code Security"
    },
    {
      icon: Smartphone,
      title: "PWA & Mobile Security",
      description: "ChatBuddy works as a Progressive Web App with offline capabilities. Your data remains secure even when using the app offline, with encrypted local storage.",
      status: "Active",
      technical: "Service Worker with encrypted IndexedDB storage and secure manifest",
      category: "Mobile Security"
    },
    {
      icon: Network,
      title: "Netlify Edge Security",
      description: "Deployed on Netlify's global edge network with built-in DDoS protection, automatic SSL certificates, and serverless edge functions for optimal security and performance.",
      status: "Active",
      technical: "Global CDN with edge computing, automatic SSL, and DDoS mitigation",
      category: "Infrastructure"
    }
  ];

  const infrastructureDetails = [
    {
      icon: Cloud,
      title: "Supabase Backend Infrastructure",
      description: "ChatBuddy uses Supabase's enterprise-grade PostgreSQL database with automatic backups, real-time subscriptions, and 99.9% uptime SLA. All user data is stored with Row Level Security policies.",
      details: [
        "PostgreSQL 15+ with real-time subscriptions for live updates", 
        "Automated daily backups with 30-day retention policy", 
        "Real-time chat session synchronization across devices", 
        "Global CDN with edge caching for optimal performance", 
        "Built-in connection pooling and automatic scaling", 
        "Point-in-time recovery and automatic failover protection"
      ]
    },
    {
      icon: Server,
      title: "Netlify Edge Platform",
      description: "ChatBuddy is deployed on Netlify's global edge network with serverless functions, providing ultra-low latency and maximum security through distributed computing.",
      details: [
        "Global edge network (190+ locations) for fast loading", 
        "Advanced DDoS protection and traffic filtering", 
        "Automatic SSL/TLS certificates with HSTS enforcement", 
        "CDN optimization with Brotli compression", 
        "Serverless edge functions for API endpoints", 
        "Git-based deployment with atomic deployments"
      ]
    },
    {
      icon: Bot,
      title: "Multi-AI Provider Architecture",
      description: "ChatBuddy connects to 6 major AI providers (OpenAI, Google Gemini, Anthropic Claude, Mistral AI, Meta Llama, DeepSeek) with direct browser connections and zero server-side conversation storage.",
      details: [
        "Direct browser-to-provider API calls (no proxy servers)", 
        "Zero conversation content logging or storage", 
        "Provider-specific security protocols and rate limiting", 
        "Intelligent failover between AI providers", 
        "Real-time provider health monitoring and status", 
        "Isolated API key management per provider"
      ]
    },
    {
      icon: Fingerprint,
      title: "Identity & Access Management",
      description: "ChatBuddy uses Supabase Auth for comprehensive identity management with JWT tokens, session management, and user profile synchronization.",
      details: [
        "JWT-based authentication with RS256 signing", 
        "Automatic token refresh and secure rotation", 
        "Session timeout with configurable duration", 
        "Password reset flows and secure session management", 
        "Real-time profile synchronization across devices", 
        "Brute force protection and rate limiting"
      ]
    }
  ];

  const dataProtection = [
    {
      category: "What ChatBuddy Securely Stores",
      icon: Database,
      color: "blue",
      items: [
        "User account information (email, hashed password with bcrypt + salt)",
        "Chat preferences (theme, language, selected AI models, chat modes)",
        "Encrypted API keys for AI providers (AES-256-GCM client-side encryption)",
        "Chat session metadata only (titles, timestamps, model used - no actual content)",
        "User profile settings (display name, avatar preferences, voice settings)",
        "Anonymized usage analytics for performance optimization and feature development"
      ]
    },
    {
      category: "What ChatBuddy Never Stores",
      icon: Shield,
      color: "green",
      items: [
        "Your actual conversations or chat content with AI models (OpenAI, Google, etc.)",
        "Unencrypted API keys or authentication tokens from AI providers",
        "Voice recordings or audio data from the voice input feature",
        "Code snippets, syntax highlighting data, or programming content",
        "Personal files, documents, or any uploaded content",
        "Biometric data, location data, device fingerprints, or tracking cookies",
        "Browser history, external website activity, or cross-site data"
      ]
    }
  ];

  const securityCertifications = [
    {
      icon: ShieldCheck,
      title: "SOC 2 Type II Compliance",
      description: "Annual third-party security audits ensuring enterprise-grade security controls",
      status: "In Progress",
      timeline: "Q2 2024"
    },
    {
      icon: Globe,
      title: "GDPR & CCPA Compliant",
      description: "Full compliance with global privacy regulations including data subject rights",
      status: "Certified",
      timeline: "Current"
    },
    {
      icon: Lock,
      title: "ISO 27001 Security Framework",
      description: "Implementation of international information security management standards",
      status: "Planned",
      timeline: "Q4 2024"
    }
  ];

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
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      <ResponsiveContainer>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                Security & Privacy
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                ChatBuddy prioritizes your security and privacy with zero-knowledge architecture, client-side encryption, and direct AI provider connections. Your conversations remain private and secure.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Zero-Knowledge Architecture
                </Badge>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  <Lock className="h-3 w-3 mr-1" />
                  AES-256 Encryption
                </Badge>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                  <Bot className="h-3 w-3 mr-1" />
                  6 AI Providers
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Security Features */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Security Architecture
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Built-in security measures protecting your AI interactions
              </p>
            </div>

            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1">
                <TabsTrigger value="features" className="text-xs md:text-sm">Security Features</TabsTrigger>
                <TabsTrigger value="infrastructure" className="text-xs md:text-sm">Infrastructure</TabsTrigger>
                <TabsTrigger value="data" className="text-xs md:text-sm">Data Protection</TabsTrigger>
                <TabsTrigger value="certifications" className="text-xs md:text-sm">Certifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {securityFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-slate-900 dark:text-white">
                                  {feature.title}
                                </CardTitle>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {feature.category}
                                </Badge>
                              </div>
                            </div>
                            <Badge 
                              variant="default"
                              className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            >
                              {feature.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {feature.description}
                          </CardDescription>
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border">
                            <strong>Technical:</strong> {feature.technical}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="infrastructure" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {infrastructureDetails.map((infra, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <infra.icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-xl text-slate-900 dark:text-white">
                              {infra.title}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {infra.description}
                          </CardDescription>
                          <div className="grid grid-cols-1 gap-2">
                            {infra.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-sm p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-700 dark:text-slate-300">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dataProtection.map((section, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className={`h-full border-slate-200 dark:border-slate-700 hover:border-${section.color}-300 dark:hover:border-${section.color}-600 transition-all duration-300 hover:shadow-lg`}>
                        <CardHeader className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 bg-${section.color}-100 dark:bg-${section.color}-900/30 rounded-lg`}>
                              <section.icon className={`h-6 w-6 text-${section.color}-600 dark:text-${section.color}-400`} />
                            </div>
                            <CardTitle className="text-xl text-slate-900 dark:text-white">
                              {section.category}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {section.items.map((item, idx) => (
                              <div key={idx} className={`flex items-start gap-3 text-sm p-3 bg-${section.color}-50 dark:bg-${section.color}-950/20 rounded-lg border border-${section.color}-100 dark:border-${section.color}-900/30`}>
                                <CheckCircle className={`h-4 w-4 text-${section.color}-500 flex-shrink-0 mt-0.5`} />
                                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="certifications" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {securityCertifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg">
                        <CardHeader className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <cert.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <Badge 
                              variant={cert.status === "Certified" ? "default" : cert.status === "In Progress" ? "secondary" : "outline"}
                              className={cert.status === "Certified" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : 
                                        cert.status === "In Progress" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" : ""}
                            >
                              {cert.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-slate-900 dark:text-white">
                            {cert.title}
                          </CardTitle>
                          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            {cert.timeline}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {cert.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.section>

          {/* Data Protection */}
          <motion.section variants={itemVariants} className="space-y-8">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white flex items-center gap-3">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Data Protection & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      What We Collect
                    </h3>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                      <li>• Account information (email, username)</li>
                      <li>• Usage analytics (anonymized)</li>
                      <li>• Technical logs for debugging</li>
                      <li>• User preferences and settings</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      What We Don't Collect
                    </h3>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                      <li>• Your API keys (stored encrypted)</li>
                      <li>• Conversation content</li>
                      <li>• Personal files or documents</li>
                      <li>• Biometric data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Contact */}
          <motion.section variants={itemVariants} className="text-center space-y-6">
            <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">
                  Security Questions?
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                  Have questions about our security practices? We're here to help.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Contact our security team at{' '}
                  <a 
                    href="mailto:security@chatbuddypro.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    security@chatbuddypro.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </ResponsiveContainer>
      
      <ModernFooter />
    </div>
  );
}
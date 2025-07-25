'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Shield, Globe, Users, Lock, AlertCircle, CheckCircle, Building, Scale, Eye, Database, Bot, Mic, Code, Smartphone, Server, Cloud, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveContainer from '@/components/Layout/ResponsiveContainer';
import { ModernFooter } from '@/components/ui-custom/ModernFooter';

export default function CompliancePage() {
  const complianceFrameworks = [
    {
      icon: Globe,
      title: "GDPR",
      subtitle: "General Data Protection Regulation",
      description: "ChatBuddy is fully compliant with GDPR requirements for European users. We implement privacy by design, provide clear data subject rights, and ensure transparent data processing for all AI interactions.",
      status: "Compliant",
      region: "European Union",
      details: [
        "Right to access your ChatBuddy profile and chat metadata",
        "Right to rectification and erasure of personal data",
        "Data portability for user profiles and preferences",
        "Explicit consent for AI provider API key storage",
        "Privacy by design in all ChatBuddy features"
      ]
    },
    {
      icon: Shield,
      title: "CCPA",
      subtitle: "California Consumer Privacy Act",
      description: "ChatBuddy complies with CCPA requirements for California residents, providing transparency about data collection and giving users control over their personal information.",
      status: "Compliant",
      region: "California, USA",
      details: [
        "Right to know what personal data ChatBuddy collects",
        "Right to delete personal information and chat metadata",
        "Right to opt-out of any data sharing (we don't sell data)",
        "Non-discrimination for exercising privacy rights",
        "Transparent privacy practices in our Privacy Policy"
      ]
    },
    {
      icon: Database,
      title: "Supabase Compliance",
      subtitle: "Database & Authentication Security",
      description: "ChatBuddy leverages Supabase's enterprise-grade compliance infrastructure, including SOC 2 Type II certification and GDPR compliance for data processing.",
      status: "Certified",
      region: "Global",
      details: [
        "SOC 2 Type II certified database infrastructure",
        "GDPR-compliant data processing and storage",
        "ISO 27001 security management standards",
        "HIPAA-ready infrastructure (not applicable to ChatBuddy)",
        "Regular third-party security audits and assessments"
      ]
    },
    {
      icon: Cloud,
      title: "Netlify Security",
      subtitle: "Deployment & Edge Security",
      description: "ChatBuddy is deployed on Netlify's secure, compliant infrastructure with enterprise-grade security controls and global edge protection.",
      status: "Certified",
      region: "Global",
      details: [
        "SOC 2 Type II certified hosting infrastructure",
        "GDPR and CCPA compliant edge computing",
        "ISO 27001 certified security management",
        "PCI DSS Level 1 compliant payment processing (future)",
        "Continuous security monitoring and threat detection"
      ]
    }
  ];

  const dataProcessingPrinciples = [
    {
      icon: Eye,
      title: "Transparency",
      description: "Clear communication about how ChatBuddy collects, processes, and stores your data. Full visibility into AI provider interactions and data flows."
    },
    {
      icon: Lock,
      title: "Data Minimization",
      description: "ChatBuddy collects only essential data: user profiles, chat metadata, and encrypted API keys. No conversation content is ever stored."
    },
    {
      icon: Users,
      title: "User Control",
      description: "Complete control over your ChatBuddy data with easy export, deletion, and privacy settings. Manage AI provider connections independently."
    },
    {
      icon: Shield,
      title: "Security First",
      description: "Client-side encryption, zero-knowledge architecture, and direct AI provider connections ensure maximum security for your conversations."
    }
  ];

  const auditReports = [
    {
      title: "ChatBuddy Security Assessment",
      date: "Q1 2025",
      status: "Completed",
      description: "Comprehensive security audit covering ChatBuddy's AI provider integrations, client-side encryption, and Supabase data protection measures."
    },
    {
      title: "Privacy Impact Assessment",
      date: "Q4 2024",
      status: "Completed",
      description: "Detailed analysis of privacy risks for ChatBuddy's voice input, AI conversations, and user data processing activities."
    },
    {
      title: "AI Provider Security Review",
      date: "Q4 2024",
      status: "Completed",
      description: "Security assessment of ChatBuddy's integrations with OpenAI, Google Gemini, Anthropic Claude, Mistral AI, Meta Llama, and DeepSeek."
    },
    {
      title: "Supabase Infrastructure Audit",
      date: "Q3 2024",
      status: "Completed",
      description: "Third-party audit of ChatBuddy's Supabase database configuration, Row Level Security policies, and authentication flows."
    }
  ];

  const complianceFeatures = [
    {
      icon: Bot,
      title: "AI Provider Compliance",
      description: "All 6 AI providers (OpenAI, Google, Anthropic, Mistral, Meta, DeepSeek) maintain their own compliance certifications",
      features: ["Direct API connections", "No conversation storage", "Provider-native security"]
    },
    {
      icon: Mic,
      title: "Voice Input Privacy",
      description: "Browser-based speech recognition with local processing and zero server-side audio storage",
      features: ["Local speech processing", "No audio transmission", "Instant transcription deletion"]
    },
    {
      icon: Code,
      title: "Code Security",
      description: "Client-side syntax highlighting and code processing with zero server-side code analysis",
      features: ["Local Prism.js processing", "No code transmission", "Secure copy-to-clipboard"]
    },
    {
      icon: Smartphone,
      title: "PWA Compliance",
      description: "Progressive Web App with offline capabilities and encrypted local storage",
      features: ["Offline functionality", "Encrypted IndexedDB", "Secure service worker"]
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-green-950/20">
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
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FileCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-800 dark:from-green-400 dark:via-blue-400 dark:to-green-300 bg-clip-text text-transparent">
                Compliance & Governance
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                ChatBuddy maintains the highest standards of compliance with international regulations, leveraging Supabase and Netlify's enterprise-grade infrastructure for global privacy and security compliance.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  <Globe className="h-3 w-3 mr-1" />
                  GDPR Compliant
                </Badge>
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  CCPA Compliant
                </Badge>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                  <Database className="h-3 w-3 mr-1" />
                  SOC 2 Infrastructure
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Compliance Frameworks */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Compliance Frameworks
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Adherence to global privacy and security standards
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {complianceFrameworks.map((framework, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                            <framework.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-slate-900 dark:text-white">
                              {framework.title}
                            </CardTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {framework.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge 
                            variant={framework.status === "Compliant" ? "default" : "secondary"}
                            className={framework.status === "Compliant" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                          >
                            {framework.status}
                          </Badge>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {framework.region}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {framework.description}
                      </CardDescription>
                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">Key Requirements:</h4>
                        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          {framework.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Data Processing Principles */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Data Processing Principles
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Core principles guiding our data handling practices
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dataProcessingPrinciples.map((principle, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="text-center border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="space-y-4">
                      <div className="flex justify-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <principle.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">
                        {principle.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {principle.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ChatBuddy-Specific Compliance Features */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                ChatBuddy Compliance Features
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Specialized compliance measures for AI chat applications
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                          <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-xl text-slate-900 dark:text-white">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">Key Features:</h4>
                        <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                          {feature.features.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Audit Reports & Documentation */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Audit Reports & Documentation
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Transparent reporting on our compliance efforts
              </p>
            </div>

            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-1">
                <TabsTrigger value="reports" className="text-sm">Audit Reports</TabsTrigger>
                <TabsTrigger value="policies" className="text-sm">Policies & Procedures</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {auditReports.map((report, index) => (
                    <Card key={index} className="border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-slate-900 dark:text-white">
                            {report.title}
                          </CardTitle>
                          <Badge 
                            variant={report.status === "Completed" ? "default" : "secondary"}
                            className={report.status === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {report.date}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-slate-600 dark:text-slate-300">
                          {report.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="policies" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">
                        Data Protection Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Comprehensive policy covering data collection, processing, storage, and deletion procedures.
                      </CardDescription>
                      <a href="/policies/data-protection" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        View Policy →
                      </a>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 dark:text-white">
                        Incident Response Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Detailed procedures for identifying, responding to, and recovering from security incidents.
                      </CardDescription>
                      <a href="/policies/incident-response" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        View Plan →
                      </a>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.section>

          {/* Contact */}
          <motion.section variants={itemVariants} className="text-center space-y-6">
            <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">
                  Compliance Questions?
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                  Need information about our compliance practices or have specific requirements?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-300">
                      Compliance Team:{' '}
                      <a 
                        href="mailto:compliance@chatbuddypro.com" 
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        compliance@chatbuddypro.com
                      </a>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-300">
                      Data Protection Officer:{' '}
                      <a 
                        href="mailto:dpo@chatbuddypro.com" 
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        dpo@chatbuddypro.com
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </ResponsiveContainer>
      
      <ModernFooter />
    </div>
  );
}
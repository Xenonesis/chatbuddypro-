'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Shield, Github, Twitter, Linkedin, Mail, ArrowUpRight, Heart, Sparkles, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Pricing", href: "/pricing" },
      { name: "API Docs", href: "/docs" }
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Security", href: "/security" },
      { name: "Compliance", href: "/compliance" }
    ]
  }
];

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "#", color: "hover:text-blue-400", bgColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20" },
  { icon: Linkedin, label: "LinkedIn", href: "#", color: "hover:text-blue-600", bgColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20" },
  { icon: Github, label: "GitHub", href: "#", color: "hover:text-gray-900 dark:hover:text-white", bgColor: "hover:bg-gray-50 dark:hover:bg-gray-800/20" },
  { icon: Mail, label: "Email", href: "#", color: "hover:text-red-500", bgColor: "hover:bg-red-50 dark:hover:bg-red-900/20" }
];

const features = [
  { icon: Zap, text: "Lightning Fast", color: "text-yellow-500" },
  { icon: Shield, text: "Secure", color: "text-green-500" },
  { icon: Sparkles, text: "AI Powered", color: "text-purple-500" },
  { icon: Globe, text: "Global", color: "text-blue-500" }
];

export function ModernFooter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

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
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
  };

  const floatingVariants = {
    animate: {
      y: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/30 border-t border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 dark:via-blue-500/20 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 via-indigo-500/3 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-emerald-500/5 via-teal-500/3 to-cyan-500/5 rounded-full blur-2xl" />
        
        {/* Animated floating elements */}
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 right-1/4 w-2 h-2 bg-blue-400/20 rounded-full"
        />
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute bottom-32 left-1/3 w-1 h-1 bg-purple-400/30 rounded-full"
        />
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-emerald-400/25 rounded-full"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="py-16"
        >
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand section */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <div className="flex items-center mb-6">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="relative flex items-center justify-center w-12 h-12 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-xl mr-4 group"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <Bot className="h-6 w-6 relative z-10" />
                </motion.div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">ChatBuddy</span>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium tracking-wide">AI POWERED</div>
                </div>
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 max-w-sm">
                The future of AI collaboration with quantum-secure encryption and context-aware intelligence.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <feature.icon className={`h-3 w-3 ${feature.color}`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* Social links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 ${social.color}`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <social.icon className="h-5 w-5 relative z-10" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Navigation sections */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
              {footerSections.map((section, sectionIndex) => (
                <motion.div 
                  key={section.title}
                  variants={itemVariants}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link 
                          href={link.href}
                          className="group flex items-center text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                        >
                          {link.name}
                          {link.external && (
                            <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Newsletter section */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Stay Updated
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                Get the latest updates on new features and AI advancements.
              </p>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300"
                >
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Bottom section */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800/60"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6 text-sm text-slate-700 dark:text-slate-300">
                <span>© 2025 ChatBuddy. All rights reserved.</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs">All systems operational</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="hidden sm:inline">Made with ❤️ for the future</span>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>SOC 2 Compliant</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
'use client';

import { Button } from '@/components/ui/button';
import { CreditCard, Zap, CheckCircle, User, Shield, MessageSquare, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  return (
    <section className={`relative py-20 sm:py-32 overflow-hidden ${className || ''}`}>
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
  );
}

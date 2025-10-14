'use client';

import { Smartphone, Monitor, Tablet, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DeviceFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface DeviceCompatibilitySectionProps {
  className?: string;
}

const deviceFeatures: DeviceFeature[] = [
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
];

export function DeviceCompatibilitySection({ className }: DeviceCompatibilitySectionProps) {
  return (
    <section className={cn("relative py-16 sm:py-24 overflow-hidden", className)}>
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
            {deviceFeatures.map((feature, index) => (
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
  );
}

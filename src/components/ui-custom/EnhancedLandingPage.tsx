'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Award, Rocket, Heart, Layers, Cpu, Lock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedLandingPageProps {
  className?: string;
}

export function EnhancedLandingPage({ className }: EnhancedLandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Enhanced Security & Trust Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950/30"></div>
        
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
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border border-red-200/50 dark:border-red-500/20"
            >
              <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">Enterprise Security</span>
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-red-800 to-orange-900 dark:from-white dark:via-red-200 dark:to-orange-200 bg-clip-text text-transparent">
              Built for Enterprise
              <span className="block mt-2">Security & Compliance</span>
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Meet the highest security standards with SOC 2 compliance, GDPR readiness, and enterprise-grade encryption
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: <Lock className="w-8 h-8" />,
                title: "SOC 2 Compliant",
                description: "Independently audited security controls",
                color: "from-red-500 to-pink-600",
                bgColor: "from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "GDPR Ready",
                description: "Full compliance with European data protection",
                color: "from-blue-500 to-indigo-600",
                bgColor: "from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20"
              },
              {
                icon: <Layers className="w-8 h-8" />,
                title: "Zero Trust",
                description: "Advanced security architecture",
                color: "from-emerald-500 to-teal-600",
                bgColor: "from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20"
              },
              {
                icon: <Cpu className="w-8 h-8" />,
                title: "End-to-End Encryption",
                description: "Military-grade data protection",
                color: "from-violet-500 to-purple-600",
                bgColor: "from-violet-50/50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/20"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full glass-enhanced border-2 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg",
                    feature.bgColor
                  )}></div>
                  
                  <CardHeader className="relative z-10 text-center pb-4">
                    <div className={cn(
                      "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4 transition-all duration-300",
                      "bg-gradient-to-br group-hover:scale-110",
                      feature.color
                    )}>
                      {feature.icon}
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 text-center">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Performance & Reliability Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-white to-slate-50 dark:from-blue-950/30 dark:via-slate-950 dark:to-slate-900"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Performance That Scales
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Built on modern infrastructure with global CDN, intelligent caching, and 99.9% uptime guarantee
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Performance metrics */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {[
                {
                  metric: "<100ms",
                  label: "Response Time",
                  description: "Lightning-fast AI responses with optimized infrastructure",
                  icon: <Rocket className="w-6 h-6" />
                },
                {
                  metric: "99.9%",
                  label: "Uptime SLA",
                  description: "Reliable service with enterprise-grade infrastructure",
                  icon: <TrendingUp className="w-6 h-6" />
                },
                {
                  metric: "Global",
                  label: "CDN Network",
                  description: "Worldwide edge locations for optimal performance",
                  icon: <Layers className="w-6 h-6" />
                },
                {
                  metric: "Auto",
                  label: "Scaling",
                  description: "Seamlessly handle traffic spikes and growth",
                  icon: <Cpu className="w-6 h-6" />
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{item.metric}</span>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{item.label}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Visual representation */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl"></div>
                
                {/* Performance chart visualization */}
                <div className="relative space-y-6">
                  <div className="text-center text-white mb-8">
                    <h3 className="text-xl font-semibold mb-2">Global Performance</h3>
                    <p className="text-slate-300 text-sm">Real-time metrics across regions</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { region: "North America", performance: 95, color: "bg-green-500" },
                      { region: "Europe", performance: 98, color: "bg-blue-500" },
                      { region: "Asia Pacific", performance: 92, color: "bg-purple-500" },
                      { region: "Global Average", performance: 96, color: "bg-indigo-500" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, width: 0 }}
                        whileInView={{ opacity: 1, width: `${item.performance}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.2 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between text-sm text-slate-300">
                          <span>{item.region}</span>
                          <span>{item.performance}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <motion.div 
                            className={cn("h-2 rounded-full", item.color)}
                            style={{ width: `${item.performance}%` }}
                          ></motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
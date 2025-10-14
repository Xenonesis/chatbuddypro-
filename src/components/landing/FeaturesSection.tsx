'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Shield, Brain, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

interface Feature {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  borderColor: string;
  shadowColor: string;
  hoverShadow: string;
  gradientBg: string;
}

interface FeaturesSectionProps {
  className?: string;
}

const features: Feature[] = [
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
];

export function FeaturesSection({ className }: FeaturesSectionProps) {
  return (
    <section className={cn("relative py-12 sm:py-20 md:py-28 overflow-hidden", className)}>
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
            <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
          {features.map((feature, index) => (
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
  );
}

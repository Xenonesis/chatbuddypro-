'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Key, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Step {
  icon: React.ReactNode;
  title: string;
  step: string;
  description: string;
  features: string[];
  gradient: string;
  bgGradient: string;
  borderColor: string;
}

interface HowItWorksSectionProps {
  className?: string;
}

const steps: Step[] = [
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
];

export function HowItWorksSection({ className }: HowItWorksSectionProps) {
  return (
    <section className={cn("relative py-20 sm:py-28 overflow-hidden", className)}>
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
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
            {steps.map((step, index) => (
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
            <MessageSquare className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

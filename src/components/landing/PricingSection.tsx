'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "outline" | "default";
  popular: boolean;
  gradient: string;
  bgGradient: string;
}

interface PricingSectionProps {
  className?: string;
}

const plans: PricingPlan[] = [
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
];

export function PricingSection({ className }: PricingSectionProps) {
  return (
    <section className={cn("relative py-16 sm:py-24 overflow-hidden", className)}>
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
          {plans.map((plan, index) => (
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
  );
}

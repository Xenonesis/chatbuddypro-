'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: "What AI models does ChatBuddy support?",
    answer: "ChatBuddy supports all major AI models including GPT-4, GPT-5, Claude 3, Gemini Pro, and more. You can switch between models seamlessly and even use multiple models in the same conversation."
  },
  {
    question: "Is my data secure with ChatBuddy?",
    answer: "Absolutely! We use quantum-resistant encryption, zero-trust architecture, and are SOC 2 compliant. Your conversations are encrypted end-to-end, and we never use your data to train AI models."
  },
  {
    question: "Can I use my own API keys?",
    answer: "Yes! You can bring your own API keys from OpenAI, Anthropic, Google, and other providers. This gives you full control over your usage and costs while benefiting from ChatBuddy's enhanced interface."
  },
  {
    question: "Does ChatBuddy work offline?",
    answer: "ChatBuddy is a Progressive Web App (PWA) that caches your chat history locally. While you need an internet connection to communicate with AI models, you can browse past conversations offline."
  },
  {
    question: "What's included in the free tier?",
    answer: "The free tier includes 1,000 messages per month, access to basic AI models, standard support, and all core features. It's perfect for trying out ChatBuddy and light usage."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no cancellation fees. You'll retain access to Pro features until the end of your billing period, and your data is always exportable."
  },
  {
    question: "Do you offer team or enterprise plans?",
    answer: "Yes! Our Enterprise plan includes unlimited messages, custom AI model training, dedicated support, on-premise deployment options, and advanced analytics. Contact our sales team for custom pricing."
  },
  {
    question: "How does context-aware AI work?",
    answer: "Our context-aware AI remembers your previous conversations, learns your preferences, and understands your workflow. This allows for more personalized and relevant responses over time."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950"></div>
      
      {/* Animated background orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/6 w-72 h-72 bg-gradient-to-r from-blue-400/10 via-indigo-400/5 to-purple-400/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/6 w-80 h-80 bg-gradient-to-r from-emerald-400/8 via-teal-400/4 to-cyan-400/8 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border border-amber-200/50 dark:border-amber-500/20"
          >
            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">FAQ</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-amber-800 to-orange-900 dark:from-white dark:via-amber-200 dark:to-orange-200 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Find answers to common questions about ChatBuddy
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={cn(
                  "w-full text-left p-6 rounded-2xl transition-all duration-300",
                  "glass-enhanced border-2",
                  openIndex === index
                    ? "border-blue-500/50 shadow-xl shadow-blue-500/10"
                    : "border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500/30 hover:shadow-lg"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-8">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={cn(
                      "h-6 w-6 transition-colors",
                      openIndex === index 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-slate-400 dark:text-slate-500"
                    )} />
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Still have questions?
          </p>
          <a 
            href="mailto:support@chatbuddy.com"
            className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}

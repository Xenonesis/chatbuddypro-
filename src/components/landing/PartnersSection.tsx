'use client';

import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

const partners = [
  { name: 'OpenAI', logo: '🤖', color: 'from-green-500 to-emerald-600' },
  { name: 'Anthropic', logo: '🧠', color: 'from-blue-500 to-indigo-600' },
  { name: 'Google AI', logo: '🎨', color: 'from-red-500 to-orange-600' },
  { name: 'Meta AI', logo: '🚀', color: 'from-purple-500 to-pink-600' },
  { name: 'Cohere', logo: '⚡', color: 'from-cyan-500 to-blue-600' },
  { name: 'Hugging Face', logo: '🤗', color: 'from-yellow-500 to-orange-600' },
];

export function PartnersSection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-500/20">
            <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Integrations</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-br from-slate-900 to-indigo-800 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
            Powered by Leading AI Providers
          </h2>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Connect with the best AI models from industry-leading providers
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-enhanced border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 text-center hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {partner.logo}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{partner.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

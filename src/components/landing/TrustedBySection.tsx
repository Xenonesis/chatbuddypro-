'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { number: "50K+", label: "Active Users", icon: Users, color: "from-blue-500 to-indigo-600" },
  { number: "99.9%", label: "Uptime", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
  { number: "1M+", label: "Messages Processed", icon: MessageSquare, color: "from-violet-500 to-purple-600" },
  { number: "24/7", label: "Support", icon: Clock, color: "from-orange-500 to-red-600" }
];

export function TrustedBySection() {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Trusted by Developers Worldwide
          </h3>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Join thousands who use ChatBuddy daily
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={cn(
                  "flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl text-white shadow-xl group-hover:scale-110 transition-all duration-300",
                  `bg-gradient-to-br ${stat.color}`
                )}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

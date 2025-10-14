'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, MessageSquare, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatItem {
  number: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

interface StatsSectionProps {
  className?: string;
}

const stats: StatItem[] = [
  { number: "50K+", label: "Active Users", icon: <Users className="w-8 h-8" />, color: "from-blue-500 to-indigo-600" },
  { number: "99.9%", label: "Uptime", icon: <TrendingUp className="w-8 h-8" />, color: "from-emerald-500 to-teal-600" },
  { number: "1M+", label: "Messages Processed", icon: <MessageSquare className="w-8 h-8" />, color: "from-violet-500 to-purple-600" },
  { number: "24/7", label: "Support", icon: <Clock className="w-8 h-8" />, color: "from-orange-500 to-red-600" }
];

const testimonials: Testimonial[] = [
  {
    quote: "ChatBuddy has revolutionized how our team collaborates with AI. The security features give us peace of mind.",
    author: "Sarah Chen",
    role: "CTO, TechCorp",
    avatar: "SC",
    rating: 5
  },
  {
    quote: "The context-aware responses are incredible. It's like having a team member who never forgets anything.",
    author: "Marcus Rodriguez",
    role: "Lead Developer, StartupXYZ",
    avatar: "MR",
    rating: 5
  },
  {
    quote: "Best AI platform we've used. The 2025 features are game-changing for our workflow.",
    author: "Emily Johnson",
    role: "Product Manager, InnovateLab",
    avatar: "EJ",
    rating: 5
  }
];

export function StatsSection({ className }: StatsSectionProps) {
  return (
    <section className={`relative py-16 sm:py-24 overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-white dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Join thousands of developers, startups, and enterprises who trust ChatBuddy for their AI needs
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl text-white shadow-xl group-hover:scale-110 transition-all duration-300 bg-gradient-to-br ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.number}</div>
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <Card className="h-full glass-enhanced border-2 border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

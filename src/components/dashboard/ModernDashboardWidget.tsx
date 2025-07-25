'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModernDashboardWidgetProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gradient?: string;
}

export function ModernDashboardWidget({
  title,
  description,
  icon,
  children,
  className,
  delay = 0,
  gradient = "from-blue-500 to-indigo-600"
}: ModernDashboardWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className={cn(
        "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 h-full",
        className
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                `bg-gradient-to-br ${gradient}`
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="text-white">
                {icon}
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              {description && (
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface AnimatedStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
  isLoading?: boolean;
}

export function AnimatedStatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  delay = 0,
  isLoading = false
}: AnimatedStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      <Card className={cn(
        "group relative overflow-hidden bg-gradient-to-br border-opacity-60 hover:shadow-lg transition-all duration-300",
        gradient
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide opacity-90">
                {title}
              </p>
              {isLoading ? (
                <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
              ) : (
                <motion.p
                  className="text-3xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: delay + 0.2 }}
                >
                  {value}
                </motion.p>
              )}
              <p className="text-xs opacity-70">{subtitle}</p>
            </div>
            <motion.div 
              className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="text-white">
                {icon}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  bgColor: string;
  textColor: string;
  delay?: number;
  isPrimary?: boolean;
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  gradient,
  bgColor,
  textColor,
  delay = 0,
  isPrimary = false
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border-0",
        bgColor,
        isPrimary ? "hover:shadow-blue-500/10" : "hover:shadow-slate-500/10"
      )}>
        <CardContent className={cn("p-6", isPrimary ? "text-center" : "")}>
          {isPrimary ? (
            <div className="flex flex-col items-center space-y-3">
              <motion.div 
                className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
                  `bg-gradient-to-br ${gradient}`
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="text-white">
                  {icon}
                </div>
              </motion.div>
              <div className="space-y-1">
                <h3 className={cn("font-semibold text-base", textColor)}>
                  {title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <motion.div 
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  `bg-gradient-to-br ${gradient}`
                )}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="text-white text-sm">
                  {icon}
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className={cn("font-medium text-sm", textColor)}>
                  {title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

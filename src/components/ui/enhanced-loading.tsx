'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Sparkles } from 'lucide-react';

interface EnhancedLoadingProps {
  message?: string;
  submessage?: string;
  type?: 'default' | 'chat' | 'auth';
}

export function EnhancedLoading({ 
  message = "Loading", 
  submessage = "Please wait...",
  type = 'default'
}: EnhancedLoadingProps) {
  const getIcon = () => {
    switch (type) {
      case 'chat':
        return <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
      case 'auth':
        return <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
      default:
        return <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          
          {/* Spinning ring */}
          <motion.div 
            className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner spinning ring */}
          <motion.div 
            className="absolute top-2 left-2 w-16 h-16 border-2 border-indigo-400 border-t-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center icon */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {getIcon()}
          </motion.div>
        </div>
        
        <div className="text-center space-y-2">
          <motion.p 
            className="text-xl font-semibold text-slate-800 dark:text-slate-200"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {message}
          </motion.p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{submessage}</p>
        </div>
        
        {/* Animated dots */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default EnhancedLoading;

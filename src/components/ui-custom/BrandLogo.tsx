'use client';

import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function BrandLogo({ 
  size = 'md', 
  animated = true,
  className = ''
}: BrandLogoProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };
  
  useEffect(() => {
    if (animated && logoRef.current) {
      const animateBubbles = () => {
        const bubbles = logoRef.current?.querySelectorAll('.chat-bubble');
        bubbles?.forEach((bubble, index) => {
          setTimeout(() => {
            bubble.classList.add('animate-bubble');
            setTimeout(() => {
              bubble.classList.remove('animate-bubble');
            }, 600);
          }, index * 300);
        });
      };
      
      // Initial animation
      setTimeout(animateBubbles, 500);
      
      // Set interval for repeating animation
      const interval = setInterval(animateBubbles, 3000);
      
      return () => clearInterval(interval);
    }
  }, [animated]);
  
  return (
    <div 
      ref={logoRef}
      className={`relative ${sizeClasses[size]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-md flex items-center justify-center">
        <MessageSquare className={`${iconSizes[size]} text-white`} />
      </div>
      <div className="chat-bubble absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full opacity-0"></div>
      <div className="chat-bubble absolute top-0 right-1 w-1.5 h-1.5 bg-blue-300 rounded-full opacity-0"></div>
      <div className="chat-bubble absolute -top-2 -left-1 w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-0"></div>
      
      <style jsx>{`
        @keyframes bubbleAppear {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        
        .animate-bubble {
          animation: bubbleAppear 0.6s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
} 
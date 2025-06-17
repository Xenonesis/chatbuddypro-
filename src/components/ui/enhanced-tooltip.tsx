import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTouchDevice } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  contentClassName?: string;
  delayDuration?: number;
  disableOnMobile?: boolean;
  followCursor?: boolean;
}

/**
 * Enhanced tooltip component that handles both desktop hover and mobile click events
 * with animations and responsive behavior
 */
export function EnhancedTooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  className,
  contentClassName,
  delayDuration = 300,
  disableOnMobile = false,
  followCursor = false,
}: EnhancedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isTouch = useTouchDevice();
  
  // If we're on a touch device and tooltips are disabled on mobile, just render children
  if (isTouch && disableOnMobile) {
    return <>{children}</>;
  }
  
  const handleMouseEnter = () => {
    if (!isTouch) {
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, delayDuration);
      
      return () => clearTimeout(timeout);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isTouch) {
      setIsVisible(false);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (followCursor) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (isTouch) {
      e.preventDefault();
      setIsVisible(!isVisible);
      
      // Add a click event to document to close tooltip when clicking outside
      if (!isVisible) {
        const handleDocumentClick = () => {
          setIsVisible(false);
          document.removeEventListener('click', handleDocumentClick);
        };
        
        // Add the event listener with a delay to prevent it from firing for the current click
        setTimeout(() => {
          document.addEventListener('click', handleDocumentClick);
        }, 0);
      }
    }
  };
  
  const getTooltipPosition = () => {
    if (followCursor) {
      return {
        top: position.y - (side === 'top' ? 10 : -10),
        left: position.x - (align === 'center' ? 0 : (align === 'start' ? -10 : 10)),
      };
    }
    
    return {};
  };
  
  const getMotionProps = () => {
    const baseProps = {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.15 }
    };
    
    switch (side) {
      case 'top':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, y: 10 },
          animate: { ...baseProps.animate, y: 0 },
          exit: { ...baseProps.exit, y: 10 }
        };
      case 'bottom':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, y: -10 },
          animate: { ...baseProps.animate, y: 0 },
          exit: { ...baseProps.exit, y: -10 }
        };
      case 'left':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, x: 10 },
          animate: { ...baseProps.animate, x: 0 },
          exit: { ...baseProps.exit, x: 10 }
        };
      case 'right':
        return {
          ...baseProps,
          initial: { ...baseProps.initial, x: -10 },
          animate: { ...baseProps.animate, x: 0 },
          exit: { ...baseProps.exit, x: -10 }
        };
      default:
        return baseProps;
    }
  };
  
  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-900 dark:bg-slate-800 rounded shadow-md",
              "max-w-xs break-words",
              side === 'top' && 'bottom-full mb-1',
              side === 'bottom' && 'top-full mt-1',
              side === 'left' && 'right-full mr-1',
              side === 'right' && 'left-full ml-1',
              align === 'start' && 'left-0',
              align === 'center' && 'left-1/2 -translate-x-1/2',
              align === 'end' && 'right-0',
              contentClassName
            )}
            style={getTooltipPosition()}
            role="tooltip"
            {...getMotionProps()}
          >
            {content}
            <div 
              className={cn(
                "absolute w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45",
                side === 'top' && 'bottom-[-4px]',
                side === 'bottom' && 'top-[-4px]',
                side === 'left' && 'right-[-4px]',
                side === 'right' && 'left-[-4px]',
                align === 'start' && 'left-2',
                align === 'center' && 'left-1/2 -translate-x-1/2',
                align === 'end' && 'right-2'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
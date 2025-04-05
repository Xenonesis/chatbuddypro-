'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';
import { useEnhancedUI } from '@/lib/hooks/useEnhancedUI';

interface MotionButtonProps extends ButtonProps {
  /**
   * The type of animation to apply
   * - 'scale': Scale up/down on hover/press
   * - 'lift': Lift up on hover, press down on click
   * - 'bounce': Bounce on click
   * - 'pulse': Pulse on hover
   * - 'shake': Shake on click (good for errors or warnings)
   * - 'spin': Spin on click (good for actions that trigger a process)
   */
  animationType?: 'scale' | 'lift' | 'bounce' | 'pulse' | 'shake' | 'spin' | 'none';
  
  /**
   * Intensity of the animation (0.5 = subtle, 1 = normal, 2 = exaggerated)
   */
  intensity?: number;
  
  /**
   * Whether to enable haptic feedback on click (uses device vibration)
   */
  enableHaptics?: boolean;
}

/**
 * A button component with motion animations and haptic feedback.
 * Extends the base Button component with additional animation options.
 */
export function MotionButton({
  children,
  className,
  animationType = 'scale',
  intensity = 1,
  enableHaptics = true,
  onClick,
  ...props
}: MotionButtonProps) {
  const { shouldUseAnimations, vibrate, isTouch } = useEnhancedUI();
  
  // Adjust animation properties based on intensity
  const getAnimationProps = () => {
    // If animations are disabled, return empty animation props
    if (!shouldUseAnimations || animationType === 'none') {
      return {};
    }
    
    // Base scale factor - adjust based on intensity
    const scaleFactor = 0.97 + (1 - intensity * 0.07);
    
    // Animation variants by type
    switch (animationType) {
      case 'scale':
        return {
          whileHover: { scale: 1 + (intensity * 0.03) },
          whileTap: { scale: scaleFactor },
        };
      case 'lift':
        return {
          whileHover: { y: -2 * intensity, boxShadow: `0 ${4 * intensity}px ${8 * intensity}px rgba(0, 0, 0, 0.1)` },
          whileTap: { y: 1 * intensity },
          transition: { type: 'spring', stiffness: 400, damping: 10 }
        };
      case 'bounce':
        return {
          whileTap: { 
            scale: [1, 0.9, 1.1, 0.95, 1], 
            transition: { duration: 0.5 } 
          }
        };
      case 'pulse':
        return {
          whileHover: { 
            scale: [1, 1 + (0.02 * intensity), 1, 1 + (0.01 * intensity), 1],
            transition: { 
              repeat: Infinity,
              duration: 2,
            }
          },
          whileTap: { scale: 0.97 }
        };
      case 'shake':
        return {
          whileTap: { 
            x: [0, -3 * intensity, 3 * intensity, -3 * intensity, 3 * intensity, 0],
            transition: { duration: 0.4 }
          }
        };
      case 'spin':
        return {
          whileTap: { 
            rotate: 360,
            transition: { duration: 0.5 }
          }
        };
      default:
        return {};
    }
  };
  
  // Handle click with haptic feedback
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableHaptics) {
      // Different vibration patterns based on animation type
      switch (animationType) {
        case 'shake':
          vibrate([10, 30, 10, 30, 10]);
          break;
        case 'bounce':
          vibrate([10, 20, 30]);
          break;
        default:
          vibrate(10);
      }
    }
    
    // Call the original onClick handler
    onClick?.(e);
  };
  
  return (
    <motion.div
      {...getAnimationProps()}
      className="inline-block"
    >
      <Button
        className={cn(
          // Add touch-friendly increased tap target on mobile
          isTouch && "touch-manipulation",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
} 
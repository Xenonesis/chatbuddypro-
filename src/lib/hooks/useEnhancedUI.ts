'use client';

import { useState, useEffect } from 'react';
import { useIsTouchDevice, useScreenSize, usePrefersReducedMotion } from './useMediaQuery';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export type EnhancedUIOptions = {
  animations: boolean;
  toastPosition: ToastPosition;
  hapticFeedback: boolean;
  soundEffects: boolean;
  extendedTooltips: boolean;
  highContrast: boolean;
  largeText: boolean;
};

const defaultOptions: EnhancedUIOptions = {
  animations: true,
  toastPosition: 'bottom-right',
  hapticFeedback: true,
  soundEffects: false,
  extendedTooltips: false,
  highContrast: false,
  largeText: false,
};

/**
 * Hook that provides enhanced UI features and responsive utilities
 */
export function useEnhancedUI() {
  // Get device information
  const { isMobile, isTablet, isDesktop, current } = useScreenSize();
  const isTouch = useIsTouchDevice();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Initialize UI options with defaults
  const [options, setOptions] = useState<EnhancedUIOptions>(defaultOptions);
  
  // Initialize in client side only
  useEffect(() => {
    try {
      // Try to load saved options from localStorage
      const savedOptions = localStorage.getItem('enhancedUIOptions');
      if (savedOptions) {
        setOptions({
          ...defaultOptions,
          ...JSON.parse(savedOptions),
        });
      }
    } catch (error) {
      console.error('Error loading UI options:', error);
    }
    
    // If user prefers reduced motion, disable animations
    if (prefersReducedMotion) {
      setOptions(prev => ({ ...prev, animations: false }));
    }
  }, [prefersReducedMotion]);
  
  // Save options to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('enhancedUIOptions', JSON.stringify(options));
    } catch (error) {
      console.error('Error saving UI options:', error);
    }
  }, [options]);
  
  // Update a single option
  const updateOption = <K extends keyof EnhancedUIOptions>(
    key: K,
    value: EnhancedUIOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };
  
  // Reset all options to defaults
  const resetOptions = () => {
    setOptions(defaultOptions);
  };
  
  // Trigger haptic feedback (if enabled and supported)
  const vibrate = (pattern: number | number[] = [10]) => {
    if (options.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
  
  // UI helper functions
  const getResponsiveClass = (
    mobile: string,
    tablet: string,
    desktop: string
  ): string => {
    return isMobile ? mobile : isTablet ? tablet : desktop;
  };
  
  // Get font size class based on largeText setting and screen size
  const getFontSizeClass = (baseSize: 'sm' | 'base' | 'lg' | 'xl'): string => {
    // Map base sizes to Tailwind classes
    const sizeMap = {
      sm: options.largeText ? 'text-base' : 'text-sm',
      base: options.largeText ? 'text-lg' : 'text-base',
      lg: options.largeText ? 'text-xl' : 'text-lg',
      xl: options.largeText ? 'text-2xl' : 'text-xl',
    };
    
    return sizeMap[baseSize];
  };
  
  // Get padding class based on screen size
  const getPaddingClass = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
    const sizeMap = {
      sm: getResponsiveClass('p-1', 'p-1.5', 'p-2'),
      md: getResponsiveClass('p-2', 'p-3', 'p-4'),
      lg: getResponsiveClass('p-3', 'p-4', 'p-6'),
    };
    
    return sizeMap[size];
  };
  
  // Get spacing class based on screen size
  const getSpacingClass = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
    const sizeMap = {
      sm: getResponsiveClass('space-y-1', 'space-y-1.5', 'space-y-2'),
      md: getResponsiveClass('space-y-2', 'space-y-3', 'space-y-4'),
      lg: getResponsiveClass('space-y-3', 'space-y-4', 'space-y-6'),
    };
    
    return sizeMap[size];
  };
  
  return {
    // Device and screen information
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    screenSize: current,
    prefersReducedMotion,
    
    // UI Options
    options,
    updateOption,
    resetOptions,
    
    // Helper functions
    vibrate,
    getResponsiveClass,
    getFontSizeClass,
    getPaddingClass,
    getSpacingClass,
    
    // Computed properties
    shouldUseAnimations: options.animations && !prefersReducedMotion,
    useExtendedTooltips: options.extendedTooltips || isMobile,
    useHighContrast: options.highContrast,
  };
} 
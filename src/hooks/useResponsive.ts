import { useState, useEffect } from 'react';

// Breakpoint values matching Tailwind CSS defaults
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions for breakpoint detection
  const isAbove = (breakpoint: Breakpoint): boolean => {
    if (!isMounted) return false;
    return windowSize.width >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint): boolean => {
    if (!isMounted) return false;
    return windowSize.width < breakpoints[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    if (!isMounted) return false;
    return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max];
  };

  // Convenience properties
  const isMobile = isBelow('sm');
  const isTablet = isBetween('sm', 'lg');
  const isDesktop = isAbove('lg');
  const isSmallScreen = isBelow('md');
  const isLargeScreen = isAbove('xl');

  // Device orientation
  const isLandscape = windowSize.width > windowSize.height;
  const isPortrait = windowSize.height >= windowSize.width;

  // Touch device detection
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  return {
    windowSize,
    isMounted,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    isLandscape,
    isPortrait,
    isTouchDevice,
    isAbove,
    isBelow,
    isBetween,
    breakpoints,
  };
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T {
  const { isMobile, isTablet, isDesktop, isMounted } = useResponsive();

  if (!isMounted) {
    return values.default;
  }

  if (isMobile && values.mobile !== undefined) {
    return values.mobile;
  }
  
  if (isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  
  if (isDesktop && values.desktop !== undefined) {
    return values.desktop;
  }

  return values.default;
}

// Hook for responsive classes
export function useResponsiveClasses(classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  base?: string;
}): string {
  const { isMobile, isTablet, isDesktop, isMounted } = useResponsive();

  if (!isMounted) {
    return classes.base || '';
  }

  let result = classes.base || '';

  if (isMobile && classes.mobile) {
    result += ` ${classes.mobile}`;
  } else if (isTablet && classes.tablet) {
    result += ` ${classes.tablet}`;
  } else if (isDesktop && classes.desktop) {
    result += ` ${classes.desktop}`;
  }

  return result.trim();
}
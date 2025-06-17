'use client';

import { useState, useEffect } from 'react';

type MediaQueryObject = {
  [key: string]: string;
};

/**
 * Predefined breakpoints matching Tailwind CSS defaults
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Hook to check if the current viewport matches a media query
 * 
 * @param query CSS media query string (e.g., '(min-width: 768px)')
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with null on server, then update on client
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Check for window object (client-side only)
    if (typeof window === 'undefined') return;
    
    // Create media query list
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);
    
    // Define callback for media query change
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}

/**
 * Hook to check if the device is likely a mobile/touch device
 * 
 * @returns Boolean indicating if the device is touch-capable
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    const checkTouch = () => {
      return (
        typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          (navigator as any).msMaxTouchPoints > 0)
      );
    };
    
    setIsTouch(checkTouch());
  }, []);
  
  return isTouch;
}

/**
 * Hook that provides boolean values for different screen sizes
 * 
 * @returns Object with boolean values for each screen size
 * @example
 * const { isMobile, isTablet, isDesktop } = useScreenSize();
 * if (isMobile) { ... }
 */
export function useScreenSize() {
  const isMobile = useMediaQuery(`(max-width: ${parseInt(breakpoints.sm) - 1}px)`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.sm}) and (max-width: ${parseInt(breakpoints.lg) - 1}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isLargeDesktop = useMediaQuery(`(min-width: ${breakpoints.xl})`);
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Current screen size as string
    current: isMobile 
      ? 'mobile' 
      : isTablet 
        ? 'tablet' 
        : isLargeDesktop 
          ? 'largeDesktop' 
          : 'desktop'
  };
}

/**
 * Hook that returns true when the screen size is below a given breakpoint
 * 
 * @param breakpoint The breakpoint to check against (e.g., 'md')
 * @returns Boolean indicating if the screen is smaller than the breakpoint
 */
export function useIsSmallerThan(breakpoint: keyof typeof breakpoints): boolean {
  return useMediaQuery(`(max-width: ${parseInt(breakpoints[breakpoint]) - 1}px)`);
}

/**
 * Hook that returns true when the screen size is above a given breakpoint
 * 
 * @param breakpoint The breakpoint to check against (e.g., 'md')
 * @returns Boolean indicating if the screen is larger than the breakpoint
 */
export function useIsLargerThan(breakpoint: keyof typeof breakpoints): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
}

/**
 * Hook to detect when user prefers reduced motion
 * 
 * @returns Boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
} 
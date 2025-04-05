'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  showLoadingIndicator?: boolean;
  onLoad?: () => void;
  onClick?: () => void;
}

/**
 * A responsive image component that handles loading states, errors, and different screen sizes
 */
export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className,
  containerClassName,
  fallbackSrc = '/images/placeholder.jpg',
  aspectRatio = '16/9',
  loading = 'lazy',
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  showLoadingIndicator = true,
  onLoad,
  onClick,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  
  // Reset loading and error states when the src changes
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setImageSrc(src);
  }, [src]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    setImageSrc(fallbackSrc);
  };
  
  // Determine object fit style
  const objectFitStyle = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }[objectFit];
  
  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        containerClassName,
        onClick && 'cursor-pointer',
        aspectRatio && `aspect-[${aspectRatio}]`
      )}
      style={{ aspectRatio }}
      onClick={onClick}
    >
      {/* Loading Indicator */}
      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse z-10">
          <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-slate-500 dark:border-t-slate-400 rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          objectFitStyle,
          isLoading ? 'opacity-0' : 'opacity-100',
          error && 'grayscale',
          className
        )}
      />
    </div>
  );
} 
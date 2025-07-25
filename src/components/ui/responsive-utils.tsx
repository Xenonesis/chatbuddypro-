import React from 'react';
import { cn } from '@/lib/utils';

// Responsive text component that scales appropriately across devices
export function ResponsiveText({ 
  children, 
  variant = 'body',
  className,
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  
  const baseClasses = {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-snug',
    body: 'text-sm sm:text-base md:text-lg leading-relaxed',
    small: 'text-xs sm:text-sm md:text-base leading-normal',
    caption: 'text-xs leading-normal'
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';
  
  return (
    <Component 
      className={cn(baseClasses[variant], className)} 
      {...props}
    >
      {children}
    </Component>
  );
}

// Responsive spacing component
export function ResponsiveSpacing({ 
  size = 'md',
  direction = 'both',
  className 
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'both' | 'vertical' | 'horizontal';
  className?: string;
}) {
  const spacingClasses = {
    xs: {
      both: 'p-2 sm:p-3 md:p-4',
      vertical: 'py-2 sm:py-3 md:py-4',
      horizontal: 'px-2 sm:px-3 md:px-4'
    },
    sm: {
      both: 'p-3 sm:p-4 md:p-6',
      vertical: 'py-3 sm:py-4 md:py-6',
      horizontal: 'px-3 sm:px-4 md:px-6'
    },
    md: {
      both: 'p-4 sm:p-6 md:p-8',
      vertical: 'py-4 sm:py-6 md:py-8',
      horizontal: 'px-4 sm:px-6 md:px-8'
    },
    lg: {
      both: 'p-6 sm:p-8 md:p-12',
      vertical: 'py-6 sm:py-8 md:py-12',
      horizontal: 'px-6 sm:px-8 md:px-12'
    },
    xl: {
      both: 'p-8 sm:p-12 md:p-16',
      vertical: 'py-8 sm:py-12 md:py-16',
      horizontal: 'px-8 sm:px-12 md:px-16'
    }
  };

  return <div className={cn(spacingClasses[size][direction], className)} />;
}

// Responsive grid component with better mobile handling
export function ResponsiveGrid({ 
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className 
}: {
  children: React.ReactNode;
  cols?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { mobile = 1, tablet = 2, desktop = 3 } = cols;
  
  const gapClasses = {
    sm: 'gap-2 sm:gap-3 md:gap-4',
    md: 'gap-3 sm:gap-4 md:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8'
  };

  const gridClasses = cn(
    'grid',
    `grid-cols-${mobile}`,
    `sm:grid-cols-${tablet}`,
    `lg:grid-cols-${desktop}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Responsive button component
export function ResponsiveButton({ 
  children,
  size = 'md',
  fullWidthOnMobile = false,
  className,
  ...props 
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidthOnMobile?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  
  const sizeClasses = {
    sm: 'h-8 sm:h-9 px-3 sm:px-4 text-sm',
    md: 'h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base',
    lg: 'h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg'
  };

  const responsiveClasses = cn(
    sizeClasses[size],
    fullWidthOnMobile && 'w-full sm:w-auto',
    'transition-all duration-200 rounded-lg font-medium',
    className
  );

  return (
    <button className={responsiveClasses} {...props}>
      {children}
    </button>
  );
}

// Responsive card component
export function ResponsiveCard({ 
  children,
  padding = 'md',
  className 
}: {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4 md:p-5',
    md: 'p-4 sm:p-6 md:p-8',
    lg: 'p-6 sm:p-8 md:p-10'
  };

  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-first container component
export function MobileFirstContainer({ 
  children,
  maxWidth = '7xl',
  className 
}: {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  className?: string;
}) {
  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6 lg:px-8',
      `max-w-${maxWidth}`,
      className
    )}>
      {children}
    </div>
  );
}

// Responsive flex component
export function ResponsiveFlex({ 
  children,
  direction = { mobile: 'col', desktop: 'row' },
  align = 'start',
  justify = 'start',
  gap = 'md',
  className 
}: {
  children: React.ReactNode;
  direction?: { mobile: 'row' | 'col'; desktop?: 'row' | 'col' };
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const { mobile, desktop = mobile } = direction;
  
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 md:gap-6',
    lg: 'gap-4 sm:gap-6 md:gap-8'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  return (
    <div className={cn(
      'flex',
      `flex-${mobile}`,
      desktop !== mobile && `lg:flex-${desktop}`,
      alignClasses[align],
      justifyClasses[justify],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}
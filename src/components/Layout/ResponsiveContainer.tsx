import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

type ResponsiveContainerProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centerContent?: boolean;
};

/**
 * A responsive container component that provides consistent layout across different screen sizes
 * 
 * @param children - The content to render inside the container
 * @param className - Additional CSS classes to apply
 * @param maxWidth - Maximum width of the container (xs: 20rem, sm: 24rem, md: 28rem, lg: 32rem, xl: 36rem, full: 100%)
 * @param padding - Padding to apply (none: 0, sm: 1rem, md: 1.5rem, lg: 2rem)
 * @param centerContent - Whether to center the content horizontally and vertically
 */
export default function ResponsiveContainer({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  centerContent = false,
}: ResponsiveContainerProps) {
  // Add client-side only state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const maxWidthClass = {
    xs: 'max-w-xs', // 20rem (320px)
    sm: 'max-w-sm', // 24rem (384px)
    md: 'max-w-md', // 28rem (448px)
    lg: 'max-w-lg', // 32rem (512px)
    xl: 'max-w-xl', // 36rem (576px)
    full: 'max-w-full', // 100%
  }[maxWidth];

  const paddingClass = {
    none: 'p-0',
    sm: 'p-2 sm:p-4',
    md: 'p-3 sm:p-6',
    lg: 'p-4 sm:p-8',
  }[padding];

  return (
    <div 
      className={cn(
        'w-full mx-auto',
        maxWidthClass,
        paddingClass,
        // Only apply client-side-specific styling when mounted
        mounted && centerContent && 'flex flex-col items-center justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A responsive section component that provides consistent sectioning with appropriate spacing
 */
export function ResponsiveSection({
  children,
  className,
  id,
  title,
  subtitle,
  titleClassName,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  titleClassName?: string;
}) {
  return (
    <section 
      id={id}
      className={cn('my-4 sm:my-6 md:my-8', className)}
    >
      {title && (
        <div className="mb-4 sm:mb-6">
          <h2 className={cn('text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-50', titleClassName)}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * A responsive grid component that adjusts columns based on screen size
 */
export function ResponsiveGrid({
  children,
  className,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}) {
  // Default to 1 column for mobile if not specified
  const { xs = 1, sm = 2, md = 3, lg = 4 } = columns;
  
  const xsColsClass = `grid-cols-${xs}`;
  const smColsClass = `sm:grid-cols-${sm}`;
  const mdColsClass = `md:grid-cols-${md}`;
  const lgColsClass = `lg:grid-cols-${lg}`;
  
  const gapClass = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
  }[gap];

  return (
    <div 
      className={cn(
        'grid',
        xsColsClass,
        smColsClass,
        mdColsClass,
        lgColsClass,
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A responsive flex component for better mobile layouts
 */
export function ResponsiveFlex({
  children,
  direction = 'col',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = true,
  className,
}: {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
  className?: string;
}) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }[gap];

  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  }[align];

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify];

  return (
    <div 
      className={cn(
        'flex',
        `flex-${direction}`,
        alignClass,
        justifyClass,
        gapClass,
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A responsive stack component for vertical layouts
 */
export function ResponsiveStack({
  children,
  spacing = 'md',
  align = 'stretch',
  className,
}: {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}) {
  const spacingClass = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  }[spacing];

  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align];

  return (
    <div className={cn('flex flex-col', spacingClass, alignClass, className)}>
      {children}
    </div>
  );
} 
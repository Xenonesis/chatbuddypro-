'use client';

import { lazy, Suspense, ComponentProps } from 'react';
import { HTMLMotionProps } from 'framer-motion';

// Lazy load framer-motion components
const MotionDiv = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.div })));
const MotionSpan = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.span })));
const MotionButton = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.button })));
const AnimatePresence = lazy(() => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })));

// Fallback component for loading state
const MotionFallback = ({ children, className, ...props }: any) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Wrapper components with suspense
export const Motion = {
  div: (props: HTMLMotionProps<'div'>) => (
    <Suspense fallback={<MotionFallback {...props} />}>
      <MotionDiv {...props} />
    </Suspense>
  ),
  span: (props: HTMLMotionProps<'span'>) => (
    <Suspense fallback={<MotionFallback {...props} />}>
      <MotionSpan {...props} />
    </Suspense>
  ),
  button: (props: HTMLMotionProps<'button'>) => (
    <Suspense fallback={<MotionFallback {...props} />}>
      <MotionButton {...props} />
    </Suspense>
  ),
};

export const LazyAnimatePresence = (props: ComponentProps<typeof AnimatePresence>) => (
  <Suspense fallback={<div>{props.children}</div>}>
    <AnimatePresence {...props} />
  </Suspense>
);
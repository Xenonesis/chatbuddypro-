import React from 'react';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={`rounded-lg border bg-white text-black shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out card-hover ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 animate-fadeIn ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <div
      className={`text-2xl font-semibold leading-none tracking-tight animate-slideIn ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <div
      className={`text-sm text-gray-500 animate-fadeIn ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={`p-6 pt-0 animate-fadeIn ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={`flex items-center p-6 pt-0 animate-slideIn ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
} 
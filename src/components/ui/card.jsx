import React from 'react';

export const Card = ({ className, children, ...props }) => (
  <div
    className={`rounded-lg border bg-white text-black shadow-sm ${className || ''}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <div
    className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
    {...props}
  >
    {children}
  </div>
);

export const CardDescription = ({ className, children, ...props }) => (
  <div
    className={`text-sm text-gray-500 ${className || ''}`}
    {...props}
  >
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div
    className={`flex items-center p-6 pt-0 ${className || ''}`}
    {...props}
  >
    {children}
  </div>
); 
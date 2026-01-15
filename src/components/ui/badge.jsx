import React from 'react';

const badgeVariants = {
  default: 'bg-slate-900 text-white',
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-400 text-slate-900',
  celebrate: 'bg-violet-500 text-white',
};

export const Badge = ({ 
  variant = 'default', 
  className = '', 
  children, 
  ...props 
}) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${badgeVariants[variant]} ${className}`}
    {...props}
  >
    {children}
  </span>
);

import React from 'react';

const buttonVariants = {
  default: 'bg-slate-900 text-white hover:bg-slate-800',
  primary: 'bg-emerald-500 text-white hover:bg-emerald-600',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
  celebrate: 'bg-violet-500 text-white hover:bg-violet-600',
};

export const Button = ({ 
  variant = 'default', 
  size = 'default',
  className = '', 
  children, 
  disabled = false,
  ...props 
}) => {
  const sizeClasses = size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base';
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${sizeClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

import React from 'react';

export const Progress = ({ value = 0, max = 100, className = '', indicatorClassName = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className={`h-full bg-emerald-500 transition-all duration-500 ease-out ${indicatorClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

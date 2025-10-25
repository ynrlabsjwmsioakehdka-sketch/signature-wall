
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 ${sizeClasses[size]}`}
      ></div>
      {text && <p className="text-slate-600 animate-pulse">{text}</p>}
    </div>
  );
};


import React from 'react';
import { cn } from '../lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const AmberButton: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const variants = {
    primary: 'bg-brand text-slate-900 hover:bg-brand/90 active:bg-brand/80 shadow-sm',
    secondary: 'bg-white/5 border border-white/10 text-zinc-text hover:bg-white/10 active:bg-white/20',
    ghost: 'bg-transparent text-zinc-muted hover:text-zinc-text hover:bg-white/5 active:bg-white/10',
    outline: 'border border-brand text-brand hover:bg-brand/5 active:bg-brand/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-6 py-3 text-base font-semibold'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

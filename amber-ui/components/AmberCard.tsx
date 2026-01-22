
import React from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  glass?: boolean;
  noPadding?: boolean;
}

export const AmberCard: React.FC<CardProps> = ({ children, className, glass, noPadding, ...props }) => {
  return (
    <div 
      className={cn(
        "rounded-xl border border-border bg-obsidian-panel shadow-sm transition-all duration-300",
        !noPadding && "p-6",
        glass && "glass-card",
        "hover:border-zinc-secondary/20 hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

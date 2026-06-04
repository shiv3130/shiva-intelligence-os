import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, title, subtitle, glass = true, children, ...props }) => {
  return (
    <div 
      className={cn(
        "rounded-xl border border-surfaceHighlight p-6 shadow-lg",
        glass ? "glass-panel" : "bg-surface",
        className
      )} 
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-textMain tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-textMuted mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

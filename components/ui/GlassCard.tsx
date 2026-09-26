import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'glow' | 'solid';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card text-on-surface',
    subtle: 'glass-card-subtle text-on-surface',
    glow: 'glass-card border-primary/25 shadow-[0_20px_48px_-12px_rgba(182,0,86,0.2)] text-on-surface',
    solid: 'bg-white/80 border border-white/90 shadow-sm text-on-surface',
  };

  return (
    <div
      className={cn(
        'rounded-3xl p-5 sm:p-6 transition-all duration-300',
        variantStyles[variant],
        hoverEffect && 'hover:-translate-y-1 hover:shadow-xl cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;

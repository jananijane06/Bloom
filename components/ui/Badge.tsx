import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'rose' | 'coral' | 'outline' | 'glass';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  ...props
}) => {
  const variants = {
    default: 'glass-pill text-on-surface',
    primary: 'bg-primary/15 text-primary border border-primary/25',
    rose: 'bg-[#B85C7A]/15 text-[#B85C7A] border border-[#B85C7A]/25',
    coral: 'bg-[#B85C7A]/15 text-[#B85C7A] border border-[#B85C7A]/25',
    outline: 'bg-white/60 text-outline border border-white/80',
    glass: 'glass-pill text-primary font-semibold border-white/90',
  };

  const dotColors = {
    default: 'bg-primary',
    primary: 'bg-primary',
    rose: 'bg-[#B85C7A]',
    coral: 'bg-[#B85C7A]',
    outline: 'bg-outline',
    glass: 'bg-primary',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold uppercase tracking-wider',
    md: 'text-[12px] px-3 py-1 gap-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full transition-all',
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || 'bg-primary')} />}
      {children}
    </span>
  );
};

export default Badge;

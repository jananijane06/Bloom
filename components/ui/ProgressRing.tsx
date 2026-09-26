import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: 'primary' | 'pink' | 'coral' | 'rose';
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 80,
  strokeWidth = 6,
  className,
  color = 'primary',
  showLabel = true,
  label,
  sublabel,
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  const colorClasses = {
    primary: 'text-primary stroke-primary',
    pink: 'text-[#B85C7A] stroke-[#B85C7A]',
    coral: 'text-[#B85C7A] stroke-[#B85C7A]',
    rose: 'text-primary-light stroke-primary-light',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          className="text-white/60"
        />
        {/* Animated Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={cn('transition-all duration-700 ease-out', colorClasses[color] || colorClasses.primary)}
        />
      </svg>

      {/* Center content */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[12px] font-bold text-on-surface">
            {label !== undefined ? label : `${Math.round(normalizedValue)}%`}
          </span>
          {sublabel && (
            <span className="text-[10px] text-outline font-medium">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressRing;

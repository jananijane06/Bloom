import React, { forwardRef } from 'react';

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, id, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-2xl border bg-white/50 px-4 py-3 text-[13px] text-on-surface placeholder:text-outline/60 outline-none backdrop-blur-md transition focus:border-primary/50 focus:bg-white/80 focus:shadow-sm ${
              icon ? 'pl-11' : ''
            } ${
              error ? 'border-[#B85C7A]/60 bg-[#B85C7A]/5' : 'border-white/80'
            } ${className}`}
            {...props}
          />
          {icon && (
            <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[18px] text-outline pointer-events-none">
              {icon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 ml-1 text-[11px] text-[#B85C7A] font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

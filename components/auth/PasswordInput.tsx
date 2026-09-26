'use client';

import React, { forwardRef, useState } from 'react';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, id, error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

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
            type={showPassword ? 'text' : 'password'}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-2xl border bg-white/50 px-4 py-3 pl-11 pr-11 text-[13px] text-on-surface placeholder:text-outline/60 outline-none backdrop-blur-md transition focus:border-primary/50 focus:bg-white/80 focus:shadow-sm ${
              error ? 'border-[#B85C7A]/60 bg-[#B85C7A]/5' : 'border-white/80'
            } ${className}`}
            {...props}
          />
          <span className="material-symbols-outlined absolute left-3.5 top-3.5 text-[18px] text-outline pointer-events-none">
            lock
          </span>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-3 text-outline hover:text-on-surface transition p-0.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <span className="material-symbols-outlined text-[19px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
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

PasswordInput.displayName = 'PasswordInput';

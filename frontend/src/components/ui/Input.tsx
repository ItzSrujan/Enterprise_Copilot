import React, { forwardRef } from 'react';
import { cn } from '@/utils/helpers';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-surface-600"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-md border text-sm transition-colors placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-surface-50 disabled:text-surface-400',
              icon ? 'pl-9' : 'pl-3',
              'pr-3 py-2',
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                : 'border-surface-300 text-surface-900 focus:border-brand-500 focus:ring-brand-500 bg-white',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-surface-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';


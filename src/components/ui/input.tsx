'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-12 px-5 text-lg',
} as const;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: keyof typeof sizeStyles;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      size = 'md',
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-[8px] border bg-white text-black placeholder:text-neutral-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
              'dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:placeholder:text-neutral-500',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300 dark:border-neutral-600',
              icon ? 'pl-10' : '',
              sizeStyles[size],
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

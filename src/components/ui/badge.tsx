import React from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  default:
    'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  success:
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  danger:
    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  accent:
    'bg-accent-50 text-accent dark:bg-accent-900/40 dark:text-accent-300',
} as const;

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
} as const;

interface BadgeProps {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  children: React.ReactNode;
  className?: string;
}

function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium uppercase rounded-full leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };

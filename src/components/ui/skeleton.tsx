import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

function Skeleton({ className, width, height, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
        rounded ? 'rounded-full' : 'rounded-[8px]',
        className
      )}
      style={{ width, height }}
    >
      <div className="absolute inset-0 bg-[length:200%_100%] animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-[10px] bg-white dark:bg-gray-900 shadow-sm">
      {/* Image */}
      <Skeleton className="w-full aspect-[3/4]" />
      {/* Title */}
      <Skeleton className="w-3/4" height={16} />
      {/* Price */}
      <Skeleton className="w-1/3" height={14} />
      {/* Rating */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={16} height={16} rounded />
        ))}
      </div>
      {/* Button */}
      <Skeleton className="w-full" height={44} />
    </div>
  );
}

export { Skeleton, ProductCardSkeleton };

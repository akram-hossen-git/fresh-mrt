import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
} as const;

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: keyof typeof sizeMap;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

function RatingStars({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  const starSize = sizeMap[size];
  const clampedRating = Math.max(0, Math.min(rating, maxStars));

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, i) => {
          const fillLevel = Math.min(1, Math.max(0, clampedRating - i));

          if (fillLevel >= 1) {
            // Fully filled star
            return (
              <Star
                key={i}
                size={starSize}
                className="text-[#F59E0B] fill-[#F59E0B]"
              />
            );
          }

          if (fillLevel > 0) {
            // Half-filled star using clip-path
            return (
              <span key={i} className="relative inline-block" style={{ width: starSize, height: starSize }}>
                <Star
                  size={starSize}
                  className="absolute inset-0 text-gray-300 dark:text-gray-600"
                />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillLevel * 100}%` }}
                >
                  <Star
                    size={starSize}
                    className="text-[#F59E0B] fill-[#F59E0B]"
                  />
                </span>
              </span>
            );
          }

          // Empty star
          return (
            <Star
              key={i}
              size={starSize}
              className="text-gray-300 dark:text-gray-600"
            />
          );
        })}
      </div>

      {showValue && (
        <span className={cn(
          'text-gray-600 dark:text-gray-400',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        )}>
          {clampedRating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="ml-0.5">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export { RatingStars };

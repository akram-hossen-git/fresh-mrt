'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max,
  className,
}: QuantitySelectorProps) {
  const canDecrement = quantity > min;
  const canIncrement = max === undefined || quantity < max;

  return (
    <div
      className={cn(
        'inline-flex items-center border border-gray-300 rounded-[8px] dark:border-gray-600',
        className
      )}
    >
      {/* Minus button */}
      <button
        onClick={() => canDecrement && onQuantityChange(quantity - 1)}
        disabled={!canDecrement}
        className="inline-flex items-center justify-center w-9 h-9 text-gray-600 transition-all duration-300 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none rounded-l-[7px] dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>

      {/* Quantity display */}
      <span className="inline-flex items-center justify-center w-10 h-9 text-sm font-medium text-black tabular-nums select-none border-x border-gray-300 transition-all duration-300 dark:text-white dark:border-gray-600">
        {quantity}
      </span>

      {/* Plus button */}
      <button
        onClick={() => canIncrement && onQuantityChange(quantity + 1)}
        disabled={!canIncrement}
        className="inline-flex items-center justify-center w-9 h-9 text-gray-600 transition-all duration-300 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none rounded-r-[7px] dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export { QuantitySelector };

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import type { CartItem as CartItemType } from '@/lib/types';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (cartId: number, quantity: number) => Promise<void>;
  onRemove: (cartId: number) => Promise<void>;
}

function CartItemRow({ item, onQuantityChange, onRemove }: CartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleQuantityChange = async (quantity: number) => {
    setIsUpdating(true);
    try {
      await onQuantityChange(item.id, quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmRemove(false), 3000);
      return;
    }
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsRemoving(false);
      setConfirmRemove(false);
    }
  };

  const lineTotal = item.price * item.quantity;

  return (
    <div
      className={cn(
        'flex gap-4 py-5 border-b border-gray-200 dark:border-gray-800 last:border-b-0 transition-opacity duration-300',
        isRemoving && 'opacity-40 pointer-events-none'
      )}
    >
      {/* Product image */}
      <div className="relative w-16 h-20 shrink-0 rounded-[8px] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {item.product.name}
          </h3>
          {item.variation && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {item.variation}
            </p>
          )}
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 sm:hidden">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className={cn('transition-opacity', isUpdating && 'opacity-50')}>
            <QuantitySelector
              quantity={item.quantity}
              onQuantityChange={handleQuantityChange}
              min={1}
            />
          </div>

          {/* Price — desktop only */}
          <span className="hidden sm:block text-sm font-semibold text-gray-900 dark:text-white min-w-[80px] text-right tabular-nums">
            {formatPrice(lineTotal)}
          </span>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className={cn(
              'inline-flex items-center justify-center w-9 h-9 rounded-[8px] transition-all duration-300',
              confirmRemove
                ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20'
            )}
            aria-label={confirmRemove ? 'Click again to confirm removal' : 'Remove item'}
            title={confirmRemove ? 'Click again to confirm' : 'Remove item'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { CartItemRow };

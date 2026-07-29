'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { cn, getDiscountPercent } from '@/lib/utils';
import { addToWishlist, removeFromWishlist } from '@/lib/api/wishlists';
import type { ProductMini } from '@/lib/types';

interface ProductCardCompactProps {
  product: ProductMini;
  className?: string;
}

export function ProductCardCompact({ product, className }: ProductCardCompactProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const discountPercent = product.has_discount
    ? getDiscountPercent(product.discount)
    : 0;

  const toggleWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (wishlistLoading) return;

      const prev = wishlisted;
      setWishlisted(!prev);
      setWishlistLoading(true);

      try {
        if (prev) {
          await removeFromWishlist(product.slug);
        } else {
          await addToWishlist(product.slug);
        }
      } catch {
        setWishlisted(prev);
      } finally {
        setWishlistLoading(false);
      }
    },
    [wishlisted, wishlistLoading, product.slug],
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.dispatchEvent(
        new CustomEvent('quick-view', { detail: { slug: product.slug } }),
      );
    },
    [product.slug],
  );

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group flex gap-4 rounded-[var(--radius-card)] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 transition-all duration-300 hover:shadow-card',
        className,
      )}
    >
      {/* Image — small square */}
      <div className="relative h-24 w-24 shrink-0 rounded-[var(--radius-button)] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={product.thumbnail_image}
          alt={product.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="96px"
        />
        {/* Discount badge */}
        {product.has_discount && discountPercent > 0 && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold bg-accent text-white rounded">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-xs text-neutral-500">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Bottom row: price + actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {product.main_price}
            </span>
            {product.has_discount && product.stroked_price && (
              <span className="text-xs text-neutral-400 line-through">
                {product.stroked_price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleWishlist}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center',
                'border border-neutral-200 dark:border-neutral-700',
                'hover:border-accent transition-colors',
              )}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                size={13}
                className={cn(
                  wishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-neutral-400',
                )}
              />
            </button>
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center',
                'bg-accent text-white',
                'hover:bg-accent-dark transition-colors',
              )}
              aria-label="Add to cart"
            >
              <ShoppingBag size={13} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

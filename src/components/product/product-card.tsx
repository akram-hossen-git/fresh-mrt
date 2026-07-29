'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Star } from 'lucide-react';
import { cn, getDiscountPercent } from '@/lib/utils';
import { addToWishlist, removeFromWishlist } from '@/lib/api/wishlists';
import type { ProductMini } from '@/lib/types';

interface ProductCardProps {
  product: ProductMini;
  className?: string;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={cn(
            i < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700',
          )}
        />
      ))}
    </div>
  );
}

export function ProductCard({ product, className }: ProductCardProps) {
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
        // Revert optimistic update
        setWishlisted(prev);
      } finally {
        setWishlistLoading(false);
      }
    },
    [wishlisted, wishlistLoading, product.slug],
  );

  const handleQuickView = useCallback(
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
      className={cn('group block', className)}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-3">
        <Image
          src={product.thumbnail_image}
          alt={product.name}
          fill
          className={cn(
            'object-cover transition-all duration-500 group-hover:scale-105',
            // When a back image exists, fade the front out on hover.
            product.back_image && 'group-hover:opacity-0',
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Back image — revealed on hover (fashion front/back swap) */}
        {product.back_image && (
          <Image
            src={product.back_image}
            alt={`${product.name} - alternate view`}
            fill
            className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Discount badge */}
        {product.has_discount && discountPercent > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-black text-white dark:bg-white dark:text-black rounded-md">
            -{discountPercent}%
          </span>
        )}

        {/* Hover actions overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Wishlist button */}
          <button
            onClick={toggleWishlist}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center',
              'bg-white/90 dark:bg-black/80 backdrop-blur-sm shadow-sm',
              'hover:bg-white dark:hover:bg-black transition-colors',
              'translate-y-2 group-hover:translate-y-0 transition-transform duration-300',
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={16}
              className={cn(
                wishlisted
                  ? 'fill-red-500 text-red-500'
                  : 'text-neutral-700 dark:text-neutral-300',
              )}
            />
          </button>

          {/* Quick view button */}
          <button
            onClick={handleQuickView}
            className={cn(
              'absolute bottom-3 left-1/2 -translate-x-1/2',
              'px-4 py-2 rounded-full flex items-center gap-2',
              'bg-white/90 dark:bg-black/80 backdrop-blur-sm shadow-sm',
              'text-xs font-medium text-neutral-800 dark:text-neutral-200',
              'hover:bg-white dark:hover:bg-black transition-colors',
              'translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75',
            )}
            aria-label="Quick view"
          >
            <Eye size={14} />
            Quick View
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {product.main_price}
          </span>
          {product.has_discount && product.stroked_price && (
            <span className="text-xs text-neutral-400 line-through">
              {product.stroked_price}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating > 0 && <RatingStars rating={product.rating} />}
      </div>
    </Link>
  );
}

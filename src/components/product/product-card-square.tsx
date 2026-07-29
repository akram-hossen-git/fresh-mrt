'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { cn, getDiscountPercent } from '@/lib/utils';
import { addToWishlist, removeFromWishlist } from '@/lib/api/wishlists';
import type { ProductMini } from '@/lib/types';

interface ProductCardSquareProps {
  product: ProductMini;
  className?: string;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
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

export function ProductCardSquare({ product, className }: ProductCardSquareProps) {
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
      // Dispatch quick-view for variant selection
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
      {/* Image container — square aspect */}
      <div className="relative aspect-square rounded-[var(--radius-card)] overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-3">
        <Image
          src={product.thumbnail_image}
          alt={product.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Discount badge */}
        {product.has_discount && discountPercent > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-bold bg-accent text-white rounded-[var(--radius-badge)]">
            -{discountPercent}%
          </span>
        )}

        {/* Wishlist — always visible */}
        <button
          onClick={toggleWishlist}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center',
            'bg-white/90 dark:bg-black/80 backdrop-blur-sm shadow-sm',
            'hover:bg-white dark:hover:bg-black transition-colors',
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={14}
            className={cn(
              wishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-neutral-600 dark:text-neutral-300',
            )}
          />
        </button>

        {/* Add to cart button — bottom of image on hover */}
        <button
          onClick={handleAddToCart}
          className={cn(
            'absolute bottom-0 left-0 right-0',
            'flex items-center justify-center gap-2 py-2.5',
            'bg-accent text-white text-xs font-semibold',
            'translate-y-full group-hover:translate-y-0 transition-transform duration-300',
          )}
          aria-label="Add to cart"
        >
          <ShoppingBag size={14} />
          Add to Cart
        </button>
      </div>

      {/* Product info */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price */}
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

        {/* Rating */}
        {product.rating > 0 && <RatingStars rating={product.rating} />}

        {/* Unit info if available */}
        {product.is_wholesale && (
          <span className="inline-block text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
            Wholesale
          </span>
        )}
      </div>
    </Link>
  );
}

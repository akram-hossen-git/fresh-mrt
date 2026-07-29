'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';
import { getWishlist, removeFromWishlist } from '@/lib/api/wishlists';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    thumbnail_image: string;
    base_price: string;
    rating: number;
  };
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await getWishlist();
      if (res.success && res.data) {
        setItems(res.data as unknown as WishlistItem[]);
      }
    } catch {
      showToast('Failed to load wishlist', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (item: WishlistItem) => {
    setRemovingIds((prev) => new Set(prev).add(item.id));
    try {
      await removeFromWishlist(item.product.slug);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast('Removed from wishlist', 'success');
    } catch {
      showToast('Failed to remove item', 'error');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingIds((prev) => new Set(prev).add(item.id));
    try {
      await addToCart(item.product.id, '', 1);
      showToast('Added to bag', 'success');
    } catch {
      showToast('Failed to add to bag', 'error');
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-6">
          My Wishlist
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-card bg-white dark:bg-gray-900 p-3 shadow-subtle">
              <Skeleton className="w-full aspect-[3/4] mb-3" />
              <Skeleton className="w-3/4 mb-2" height={14} />
              <Skeleton className="w-1/3 mb-3" height={14} />
              <Skeleton className="w-full" height={40} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-1">
        My Wishlist
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-card bg-white dark:bg-gray-900 shadow-subtle">
          <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-pink-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your wishlist is empty
          </p>
          <Link href="/">
            <Button variant="primary" size="md">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => {
            const isRemoving = removingIds.has(item.id);
            const isAdding = addingIds.has(item.id);

            return (
              <div
                key={item.id}
                className={cn(
                  'relative rounded-card bg-white dark:bg-gray-900 shadow-subtle hover:shadow-card transition-all duration-300 overflow-hidden group',
                  isRemoving && 'opacity-40 pointer-events-none'
                )}
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item)}
                  disabled={isRemoving}
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove from wishlist"
                >
                  <X size={16} />
                </button>

                {/* Product image */}
                <Link href={`/products/${item.product.slug}`}>
                  <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={item.product.thumbnail_image}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {item.product.base_price}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleAddToCart(item)}
                    isLoading={isAdding}
                    icon={<ShoppingBag size={14} />}
                  >
                    Add to Bag
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

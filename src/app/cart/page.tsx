'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';
import { getCartItems, getCartSummary } from '@/lib/api/cart';
import { applyCoupon, removeCoupon } from '@/lib/api/checkout';
import { CartItemRow } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { CartItem, CartSummary as CartSummaryType } from '@/lib/types';

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const { tempUserId, updateQuantity, removeFromCart, refreshCart } = useCart();
  const { showToast } = useToast();

  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCartData = useCallback(async () => {
    try {
      const userId = user?.id;
      const tempId = !isAuthenticated ? (tempUserId ?? undefined) : undefined;

      const [itemsRes, summaryRes] = await Promise.all([
        getCartItems(userId, tempId),
        getCartSummary(userId, tempId),
      ]);

      if (itemsRes.success) {
        setItems(itemsRes.data);
      }

      if (summaryRes.success && summaryRes.data) {
        const d = summaryRes.data;
        setSummary({
          sub_total: String(d.sub_total ?? '$ 0.00'),
          tax: String(d.tax ?? '$ 0.00'),
          shipping_cost: String(d.shipping_cost ?? '$ 0.00'),
          discount: String(d.discount ?? '$ 0.00'),
          grand_total: String(d.grand_total ?? '$ 0.00'),
          grand_total_value: Number(d.grand_total_value ?? 0),
          coupon_applied: Boolean(d.coupon_applied),
          coupon_code: d.coupon_code ? String(d.coupon_code) : null,
        });
      }
    } catch {
      showToast('Failed to load cart', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, tempUserId, showToast]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  const handleQuantityChange = async (cartId: number, quantity: number) => {
    try {
      await updateQuantity(cartId, quantity);
      await fetchCartData();
    } catch {
      showToast('Failed to update quantity', 'error');
    }
  };

  const handleRemove = async (cartId: number) => {
    try {
      await removeFromCart(cartId);
      await fetchCartData();
      await refreshCart();
      showToast('Item removed from bag', 'success');
    } catch {
      showToast('Failed to remove item', 'error');
    }
  };

  const handleApplyCoupon = async (code: string) => {
    if (!user?.id) {
      showToast('Please sign in to apply a coupon', 'info');
      return;
    }
    try {
      const res = await applyCoupon(code, user.id);
      if (res.result) {
        showToast('Coupon applied!', 'success');
        await fetchCartData();
      } else {
        showToast(res.message || 'Invalid coupon code', 'error');
      }
    } catch {
      showToast('Failed to apply coupon', 'error');
    }
  };

  const handleRemoveCoupon = async () => {
    if (!user?.id) return;
    try {
      const res = await removeCoupon(user.id);
      if (res.result) {
        showToast('Coupon removed', 'success');
        await fetchCartData();
      }
    } catch {
      showToast('Failed to remove coupon', 'error');
    }
  };

  // Group items by seller
  const groupedItems = items.reduce<Record<number, CartItem[]>>((groups, item) => {
    if (!groups[item.seller_id]) groups[item.seller_id] = [];
    groups[item.seller_id].push(item);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Skeleton className="w-48 mb-6" height={32} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-4">
                <Skeleton className="w-16 h-20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-3/4" height={16} />
                  <Skeleton className="w-1/3" height={14} />
                  <Skeleton className="w-24" height={36} />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-80 rounded-card" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Your bag is empty
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
          Looks like you haven&apos;t added anything yet. Explore our collections and find something you love.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Page title */}
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-1">
        Shopping Bag
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Left — Items */}
        <div>
          {Object.entries(groupedItems).map(([sellerId, sellerItems]) => (
            <div key={sellerId} className="mb-6 last:mb-0">
              {Object.keys(groupedItems).length > 1 && (
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                  Seller #{sellerId}
                </p>
              )}
              {sellerItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Right — Summary */}
        {summary && (
          <CartSummary
            summary={summary}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
          />
        )}
      </div>
    </div>
  );
}

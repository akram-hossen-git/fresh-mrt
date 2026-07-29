'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CartSummary as CartSummaryType } from '@/lib/types';

interface CartSummaryProps {
  summary: CartSummaryType;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
}

function CartSummary({ summary, onApplyCoupon, onRemoveCoupon }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    try {
      await onApplyCoupon(couponCode.trim());
      setCouponCode('');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setIsRemovingCoupon(true);
    try {
      await onRemoveCoupon();
    } finally {
      setIsRemovingCoupon(false);
    }
  };

  const hasDiscount = summary.discount && summary.discount !== '$ 0.00' && summary.discount !== '$0.00';

  return (
    <div className="rounded-card bg-white dark:bg-gray-900 shadow-card p-6 sticky top-24">
      <h2 className="font-display text-lg font-semibold text-gray-900 dark:text-white mb-5">
        Order Summary
      </h2>

      {/* Line items */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">{summary.sub_total}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Shipping</span>
          <span className="font-medium text-gray-900 dark:text-white">{summary.shipping_cost}</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Tax</span>
          <span className="font-medium text-gray-900 dark:text-white">{summary.tax}</span>
        </div>
        {hasDiscount && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-medium">-{summary.discount}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

      {/* Grand total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-base font-semibold text-gray-900 dark:text-white">
          Grand Total
        </span>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {summary.grand_total}
        </span>
      </div>

      {/* Coupon section */}
      <div className="mb-6">
        {summary.coupon_applied && summary.coupon_code ? (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-[8px] bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
            <div className="flex items-center gap-2 text-sm">
              <Tag size={14} className="text-accent" />
              <span className="font-medium text-accent">{summary.coupon_code}</span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={isRemovingCoupon}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              aria-label="Remove coupon"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              size="sm"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              containerClassName="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyCoupon}
              isLoading={isApplying}
              disabled={!couponCode.trim()}
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Proceed to checkout */}
      <Link href="/checkout" className="block">
        <Button fullWidth variant="primary" size="lg" icon={<ArrowRight size={18} />}>
          Proceed to Checkout
        </Button>
      </Link>

      {/* Continue shopping */}
      <Link
        href="/"
        className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ShoppingBag size={14} />
        Continue Shopping
      </Link>
    </div>
  );
}

export { CartSummary };

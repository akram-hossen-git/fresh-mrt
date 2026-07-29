'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductGrid } from '@/components/product/product-grid';
import type { ProductMini } from '@/lib/types';

interface TabData {
  key: string;
  label: string;
  products: ProductMini[];
}

interface ShopTabsProps {
  shopId: number;
  allProducts: ProductMini[];
  topProducts: ProductMini[];
  newProducts: ProductMini[];
  featuredProducts: ProductMini[];
}

const TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Products' },
  { key: 'top', label: 'Top Selling' },
  { key: 'new', label: 'New Arrivals' },
  { key: 'featured', label: 'Featured' },
];

export function ShopTabs({
  shopId,
  allProducts,
  topProducts,
  newProducts,
  featuredProducts,
}: ShopTabsProps) {
  const [activeTab, setActiveTab] = useState('all');

  const tabData: Record<string, ProductMini[]> = {
    all: allProducts,
    top: topProducts,
    new: newProducts,
    featured: featuredProducts,
  };

  const activeProducts = tabData[activeTab] ?? [];

  return (
    <div>
      {/* Tab navigation */}
      <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Shop product tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tabData[tab.key]?.length ?? 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap',
                  isActive
                    ? 'text-[accent]'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      'ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      isActive
                        ? 'bg-[accent]/10 text-[accent]'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                    )}
                  >
                    {count}
                  </span>
                )}
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[accent] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Product grid for active tab */}
      {activeProducts.length > 0 ? (
        <ProductGrid products={activeProducts} columns={4} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[8px] border border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            No products in this category
          </p>
          <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
            Check back later for updates.
          </p>
        </div>
      )}
    </div>
  );
}

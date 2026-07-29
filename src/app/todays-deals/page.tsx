import type { Metadata } from 'next';
import { getTodaysDeals } from '@/lib/api/products';
import { SectionHeader } from '@/components/home/section-header';
import { ProductGrid } from '@/components/product/product-grid';
import { storeConfig } from '@/config/store.config';
import type { ProductMini } from '@/lib/types';

export const metadata: Metadata = {
  title: `Today's Deals | ${storeConfig.content.name}`,
  description: 'Limited-time offers on hand-selected styles.',
};

export default async function TodaysDealsPage() {
  let products: ProductMini[] = [];

  try {
    const res = await getTodaysDeals();
    products = res.data ?? [];
  } catch {
    // fallback to empty
  }

  return (
    <div className="container mx-auto py-12">
      <SectionHeader
        title="Today's Deals"
        subtitle="Limited-time offers on hand-selected styles"
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            No deals available at the moment.
          </p>
        </div>
      ) : (
        <div className="mt-10">
          <ProductGrid products={products} columns={4} />
        </div>
      )}
    </div>
  );
}

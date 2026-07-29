import type { Metadata } from 'next';
import { getBestSellers } from '@/lib/api/products';
import { SectionHeader } from '@/components/home/section-header';
import { ProductGrid } from '@/components/product/product-grid';
import { storeConfig } from '@/config/store.config';
import type { ProductMini } from '@/lib/types';

export const metadata: Metadata = {
  title: `Best Sellers | ${storeConfig.content.name}`,
  description: 'Our most loved pieces, chosen by customers like you.',
};

export default async function BestSellersPage() {
  let products: ProductMini[] = [];

  try {
    const res = await getBestSellers();
    products = res.data ?? [];
  } catch {
    // fallback to empty
  }

  return (
    <div className="container mx-auto py-12">
      <SectionHeader
        title="Best Sellers"
        subtitle="Our most loved pieces, chosen by customers like you"
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            No best sellers available at the moment.
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

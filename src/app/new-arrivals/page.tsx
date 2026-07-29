import type { Metadata } from 'next';
import { getFeaturedProducts } from '@/lib/api/products';
import { SectionHeader } from '@/components/home/section-header';
import { ProductGrid } from '@/components/product/product-grid';
import { storeConfig } from '@/config/store.config';
import type { ProductMini } from '@/lib/types';

export const metadata: Metadata = {
  title: `New Arrivals | ${storeConfig.content.name}`,
  description: 'Discover the latest additions to our curated collection.',
};

export default async function NewArrivalsPage() {
  let products: ProductMini[] = [];

  try {
    const res = await getFeaturedProducts();
    products = res.data ?? [];
  } catch {
    // fallback to empty
  }

  return (
    <div className="container mx-auto py-12">
      <SectionHeader
        title="New Arrivals"
        subtitle="Discover the latest additions to our curated collection"
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            No new arrivals available at the moment.
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

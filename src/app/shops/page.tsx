import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Store, ChevronRight } from 'lucide-react';
import { getShops } from '@/lib/api/shops';
import { RatingStars } from '@/components/ui/rating-stars';
import { CategoryPagination } from '@/components/category/category-pagination';
import { storeConfig } from '@/config/store.config';
import type { ShopMini } from '@/lib/types/shop';

export const metadata: Metadata = {
  title: `Shops | ${storeConfig.content.name}`,
};

interface ShopsPageProps {
  searchParams: Promise<{ page?: string }>;
}

function ShopCard({ shop }: { shop: ShopMini }) {
  return (
    <div className="group relative flex flex-col items-center rounded-[8px] border border-neutral-200 bg-white p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-[accent]/30 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-[accent]/40">
      {/* Logo */}
      <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-neutral-100 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
        {shop.logo ? (
          <Image
            src={shop.logo}
            alt={shop.name}
            fill
            className="object-cover transition-all duration-300 group-hover:scale-105"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Store className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="mb-2 font-display text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        {shop.name}
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <RatingStars rating={shop.rating} size="sm" showValue />
      </div>

      {/* Visit Shop link */}
      <Link
        href={`/shops/${shop.slug}`}
        className="inline-flex items-center gap-1.5 rounded-[8px] bg-[accent] px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-accent-dark"
      >
        Visit Shop
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export default async function ShopsPage({ searchParams }: ShopsPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const result = await getShops(currentPage);
  const shops = result.data ?? [];
  const totalPages = result.meta?.last_page ?? 1;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link
              href="/"
              className="hover:text-[accent] transition-all duration-300"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Shops
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-display text-3xl font-bold text-neutral-900 dark:text-neutral-50 md:text-4xl">
            Our Shops
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Discover trusted sellers and browse their curated collections.
          </p>
        </div>
      </div>

      {/* Shop grid */}
      <div className="container mx-auto px-4 py-10">
        {shops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shops.map((shop, index) => (
              <div
                key={shop.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <ShopCard shop={shop} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6">
              <Store className="h-9 w-9 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No shops found
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Check back later for new shops.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <CategoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </main>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { ProductGrid } from '@/components/product/product-grid';
import { SameDayCutoff } from './same-day-cutoff';
import type { ProductMini } from '@/lib/types';
import type { FlashDeal } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Same-Day Deals (grocery)                                           */
/*                                                                     */
/*  Wireframe-locked merge of the fashion preset's separate            */
/*  flash-deals + todays-deals sections into ONE grocery section       */
/*  headed by the same-day (order-by-2pm) cutoff countdown.            */
/*                                                                     */
/*  - Flash-deal products render as a horizontal strip (their own      */
/*    FlashDealProduct shape: image / name / price / links.details).   */
/*  - Today's deals render through the shared ProductGrid (ProductMini)*/
/*    using the grocery 'square' card via store config.                */
/* ------------------------------------------------------------------ */

interface SameDayDealsProps {
  todaysDeals: ProductMini[];
  flashDeals: FlashDeal[];
  columns?: 2 | 3 | 4 | 5;
}

export function SameDayDeals({ todaysDeals, flashDeals, columns = 5 }: SameDayDealsProps) {
  // Flatten flash-deal products from the first deal that actually has any.
  const flashProducts = flashDeals.flatMap((d) => d.products?.data ?? []);

  // Nothing to show -> render nothing (keeps homepage clean when data is empty).
  if (todaysDeals.length === 0 && flashProducts.length === 0) return null;

  return (
    <section className="bg-accent-light dark:bg-neutral-900 mt-6 md:mt-8 py-6 md:py-8">
      <div className="container mx-auto">
        {/* Header: title + same-day cutoff countdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">
            Same-Day Deals
          </h2>
          <SameDayCutoff className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-dark dark:text-accent" />
        </div>

        {/* Flash-deal products strip */}
        {flashProducts.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 mb-6 -mx-4 px-4 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {flashProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="shrink-0 snap-start w-32 md:w-40 group"
              >
                <div className="relative aspect-square rounded-[var(--radius-card)] overflow-hidden bg-white dark:bg-neutral-800 mb-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="160px"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white bg-accent rounded-full">
                    Deal
                  </span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 truncate group-hover:text-accent transition-colors">
                  {product.name}
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-0.5">
                  {product.price}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Today's deals grid */}
        {todaysDeals.length > 0 && (
          <ProductGrid products={todaysDeals} columns={columns} />
        )}
      </div>
    </section>
  );
}

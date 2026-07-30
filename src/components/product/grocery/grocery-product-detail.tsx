import Link from 'next/link';
import { ChevronRight, Store } from 'lucide-react';

import GroceryProductGallery from '@/components/product/grocery/grocery-product-gallery';
import { GroceryBuyBox } from '@/components/product/grocery/grocery-buy-box';
import { ProductReviews } from '@/components/product/product-reviews';
import { ProductAccordion } from '@/components/product/add-to-cart-section';
import type { AccordionSection } from '@/components/product/add-to-cart-section';
import { ProductVariantProvider } from '@/components/product/product-variant-context';
import { ProductGrid } from '@/components/product/product-grid';
import { SectionHeader } from '@/components/home/section-header';
import { RatingStars } from '@/components/ui/rating-stars';
import { SameDayCutoff } from '@/components/home/grocery/same-day-cutoff';
import { truncateText } from '@/lib/utils';
import type { ProductDetail, ProductMini } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Grocery Product Detail (locked spec 2026-07-30)                    */
/*                                                                     */
/*  Deliberately different from the fashion detail page:               */
/*    - Product name is normal-weight sentence case, NOT the           */
/*      font-display uppercase treatment. "ORGANIC WHOLE MILK 1L"      */
/*      shouted at you is a fashion mannerism; grocery names are read, */
/*      not admired.                                                   */
/*    - Breadcrumb is the CATEGORY path (Dairy > Milk), not the brand. */
/*      Shoppers navigate groceries by aisle; brand is incidental.     */
/*    - The seller/shop block is demoted into Additional Information.  */
/*      Single-vendor grocery shoppers don't pick a store per item.    */
/*    - Estimated-shipping-days box is replaced by the same-day cutoff */
/*      countdown, matching the delivery model used across the         */
/*      grocery surfaces.                                              */
/*    - No hardcoded USD "$50 free shipping / 30-day returns"          */
/*      accordion — the store prices in BDT and that copy was a lie.   */
/*    - Reviews collapse into an accordion instead of owning a full    */
/*      section. Related grids stay at columns={4}: the spec called    */
/*      for 2, but columnClasses[2] has no lg/xl step, so it left      */
/*      giant cards on desktop. Mobile is grid-cols-2 either way.      */
/*                                                                     */
/*  Gallery and buy box are both grocery-specific. The buy box owns    */
/*  price, pack-size chips, quantity and the mobile sticky bar, so     */
/*  this file renders no LivePriceDisplay/AddToCartSection of its own. */
/* ------------------------------------------------------------------ */

interface GroceryProductDetailProps {
  product: ProductDetail;
  slug: string;
  topFromSeller: ProductMini[];
  frequentlyBought: ProductMini[];
}

export function GroceryProductDetail({
  product,
  slug,
  topFromSeller,
  frequentlyBought,
}: GroceryProductDetailProps) {
  const category = product.category ?? null;
  const parentCategory = category?.parent ?? null;

  /* ---------------------------------------------------------------- */
  /*  Accordions: About / Additional Information / Reviews            */
  /* ---------------------------------------------------------------- */
  const accordionSections: AccordionSection[] = [
    {
      title: 'About this item',
      content: product.description || 'No description available.',
      isHtml: true,
      defaultOpen: true,
    },
    {
      title: 'Additional Information',
      node: (
        <dl className="space-y-2">
          <div className="flex items-baseline gap-2">
            <dt className="min-w-[80px] font-medium text-neutral-700 dark:text-neutral-300">
              Pack size:
            </dt>
            <dd>{product.unit || 'N/A'}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="min-w-[80px] font-medium text-neutral-700 dark:text-neutral-300">
              Brand:
            </dt>
            <dd>{product.brand?.name || 'N/A'}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="min-w-[80px] font-medium text-neutral-700 dark:text-neutral-300">
              Tags:
            </dt>
            <dd>{product.tags?.length > 0 ? product.tags.join(', ') : 'N/A'}</dd>
          </div>
          {product.shop_name && (
            <div className="flex items-baseline gap-2">
              <dt className="min-w-[80px] font-medium text-neutral-700 dark:text-neutral-300">
                Sold by:
              </dt>
              <dd>
                <Link
                  href={`/shops/${product.shop_slug}`}
                  className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                >
                  <Store size={14} />
                  {product.shop_name}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      ),
    },
    {
      title: 'Reviews',
      node: <ProductReviews productId={product.id} hideHeading />,
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Bottom padding clears the mobile sticky buy bar (which itself sits
          above the h-14 tab bar). Not needed from lg, where the bar hides. */}
      <div className="container mx-auto py-4 pb-32 lg:py-8 lg:pb-8">
        {/* -------------------------------------------------------- */}
        {/*  Category breadcrumb (Home > Dairy > Milk > product)      */}
        {/* -------------------------------------------------------- */}
        <nav aria-label="Breadcrumb" className="mb-3 lg:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 lg:text-sm">
            <li>
              <Link href="/" className="transition-colors hover:text-accent">
                Home
              </Link>
            </li>

            {parentCategory && (
              <>
                <li aria-hidden="true">
                  <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500" />
                </li>
                <li>
                  <Link
                    href={`/categories/${parentCategory.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    {parentCategory.name}
                  </Link>
                </li>
              </>
            )}

            {category ? (
              <>
                <li aria-hidden="true">
                  <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500" />
                </li>
                <li>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li aria-hidden="true">
                  <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500" />
                </li>
                <li>
                  <Link href="/categories" className="transition-colors hover:text-accent">
                    Categories
                  </Link>
                </li>
              </>
            )}

            <li aria-hidden="true">
              <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500" />
            </li>
            <li>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {truncateText(product.name, 40)}
              </span>
            </li>
          </ol>
        </nav>

        <ProductVariantProvider>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,44%)_1fr] lg:gap-12">
            {/* ---- Left: gallery ---- */}
            <div>
              <GroceryProductGallery photos={product.photos} productName={product.name} />
            </div>

            {/* ---- Right: buy column ---- */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-col gap-4">
                {/* Pack size, above the name — it's the first thing a
                    grocery shopper checks after the product itself. */}
                {product.unit && (
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {product.unit}
                  </p>
                )}

                {/* Sentence-case name, normal weight (locked spec) */}
                <h1 className="text-xl font-semibold leading-snug text-neutral-900 dark:text-white lg:text-2xl">
                  {product.name}
                </h1>

                {product.rating_count > 0 && (
                  <RatingStars
                    rating={product.rating}
                    showValue
                    reviewCount={product.rating_count}
                  />
                )}

                <GroceryBuyBox product={product} slug={slug} />

                {/* Same-day cutoff replaces the est-shipping-days box */}
                <SameDayCutoff className="inline-flex w-fit self-start items-center gap-2 rounded-[var(--radius-button)] border border-accent bg-accent-light px-3 py-2 text-sm text-accent-dark dark:border-accent dark:bg-transparent dark:text-accent" />

                <ProductAccordion sections={accordionSections} />
              </div>
            </div>
          </div>
        </ProductVariantProvider>

        {/* -------------------------------------------------------- */}
        {/*  Related products                                         */}
        {/* -------------------------------------------------------- */}
        <div className="mt-10 space-y-10 lg:mt-16 lg:space-y-16">
          {frequentlyBought.length > 0 && (
            <section>
              <SectionHeader title="Frequently Bought Together" />
              <ProductGrid products={frequentlyBought} columns={4} />
            </section>
          )}

          {topFromSeller.length > 0 && (
            <section>
              <SectionHeader title="You May Also Like" />
              <ProductGrid products={topFromSeller} columns={4} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

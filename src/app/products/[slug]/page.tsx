import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Truck, Store } from 'lucide-react';
import { getProductBySlug, getTopFromSeller, getFrequentlyBought } from '@/lib/api/products';
import ProductGallery from '@/components/product/product-gallery';
import { LivePriceDisplay } from '@/components/product/live-price-display';
import { ProductReviews } from '@/components/product/product-reviews';
import { AddToCartSection, ProductAccordion } from '@/components/product/add-to-cart-section';
import type { AccordionSection } from '@/components/product/add-to-cart-section';
import { ProductVariantProvider } from '@/components/product/product-variant-context';
import { ProductGrid } from '@/components/product/product-grid';
import { SectionHeader } from '@/components/home/section-header';
import { RatingStars } from '@/components/ui/rating-stars';
import { GroceryProductDetail } from '@/components/product/grocery/grocery-product-detail';
import { storeConfig } from '@/config/store.config';
import { truncateText } from '@/lib/utils';
import type { ProductDetail, ProductMini } from '@/lib/types';

/* -------------------------------------------------------------------------- */
/*  Metadata                                                                  */
/* -------------------------------------------------------------------------- */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await getProductBySlug(slug);
    const product = response.data?.[0];
    if (!product) {
      return { title: 'Product Not Found' };
    }
    const plainDescription = product.description
      ? product.description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
      : '';
    return {
      title: product.name,
      description: truncateText(plainDescription, 160),
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const response = await getProductBySlug(slug);
  const product = response.data?.[0];

  if (!product) {
    notFound();
  }

  /* Parallel data fetching for related products */
  const [topFromSellerResult, frequentlyBoughtResult] = await Promise.allSettled([
    getTopFromSeller(slug),
    getFrequentlyBought(slug),
  ]);

  const topFromSeller =
    topFromSellerResult.status === 'fulfilled'
      ? topFromSellerResult.value.data ?? []
      : [];
  const frequentlyBought =
    frequentlyBoughtResult.status === 'fulfilled'
      ? frequentlyBoughtResult.value.data ?? []
      : [];

  /* ------------------------------------------------------------------ */
  /*  Niche gate. Grocery gets its own layout (category breadcrumb,      */
  /*  sentence-case name, same-day cutoff, demoted shop block).          */
  /*  Same branch pattern as src/app/categories/page.tsx.                */
  /* ------------------------------------------------------------------ */
  if (storeConfig.headerStyle === 'grocery') {
    return (
      <GroceryProductDetail
        product={product}
        slug={slug}
        topFromSeller={topFromSeller}
        frequentlyBought={frequentlyBought}
      />
    );
  }

  return (
    <FashionProductDetailView
      product={product}
      slug={slug}
      topFromSeller={topFromSeller}
      frequentlyBought={frequentlyBought}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Fashion view — the original layout, unchanged                             */
/* -------------------------------------------------------------------------- */

interface ProductDetailViewProps {
  product: ProductDetail;
  slug: string;
  topFromSeller: ProductMini[];
  frequentlyBought: ProductMini[];
}

function FashionProductDetailView({
  product,
  slug,
  topFromSeller,
  frequentlyBought,
}: ProductDetailViewProps) {
  /* Build accordion sections */
  const accordionSections: AccordionSection[] = [
    {
      title: 'Description',
      content: product.description || 'No description available.',
      isHtml: true,
    },
    {
      title: 'Additional Information',
      items: [
        { label: 'Unit', value: product.unit || 'N/A' },
        { label: 'Brand', value: product.brand?.name || 'N/A' },
        {
          label: 'Tags',
          value: product.tags?.length > 0 ? product.tags.join(', ') : 'N/A',
        },
      ],
    },
    {
      title: 'Shipping & Returns',
      content:
        'We offer free standard shipping on orders over $50. Express and overnight options are available at checkout. ' +
        'Returns are accepted within 30 days of delivery in original condition. ' +
        'Please contact our support team to initiate a return or exchange.',
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto py-8">
        {/* ---------------------------------------------------------------- */}
        {/*  Two-Column Product Layout                                       */}
        {/* ---------------------------------------------------------------- */}
        <ProductVariantProvider>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[55%_1fr] lg:gap-12">
          {/* Left Column — Gallery (55%) */}
          <div>
            <ProductGallery photos={product.photos} productName={product.name} />
          </div>

          {/* Right Column — Sticky Sidebar (45%) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-6">
              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  <li>
                    <Link
                      href="/"
                      className="transition-all duration-300 hover:text-accent"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500" />
                  </li>
                  {product.brand?.name ? (
                    <>
                      <li>
                        <Link
                          href={`/brands/${product.brand.slug}`}
                          className="transition-all duration-300 hover:text-accent"
                        >
                          {product.brand.name}
                        </Link>
                      </li>
                      <li>
                        <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500" />
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/products"
                          className="transition-all duration-300 hover:text-accent"
                        >
                          Products
                        </Link>
                      </li>
                      <li>
                        <ChevronRight size={14} className="text-neutral-400 dark:text-neutral-500" />
                      </li>
                    </>
                  )}
                  <li>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {truncateText(product.name, 40)}
                    </span>
                  </li>
                </ol>
              </nav>

              {/* Shop Name + Visit Store */}
              <div className="flex items-center gap-3">
                {product.shop_logo && (
                  <Image
                    src={product.shop_logo}
                    alt={product.shop_name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {product.shop_name}
                  </span>
                  <Link
                    href={`/shops/${product.shop_slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent transition-all duration-300 hover:underline"
                  >
                    <Store size={14} />
                    Visit Store
                  </Link>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="font-display text-2xl md:text-3xl font-black uppercase leading-tight tracking-tight text-neutral-900 dark:text-white">
                {product.name}
              </h1>

              {/* Rating Stars */}
              <RatingStars
                rating={product.rating}
                showValue
                reviewCount={product.rating_count}
              />

              {/* Price Display */}
              <LivePriceDisplay
                mainPrice={product.main_price}
                strokedPrice={product.stroked_price}
                hasDiscount={product.has_discount}
                discount={product.discount}
                currencySymbol={product.currency_symbol}
              />

              {/* Add to Cart Section (client component) */}
              <AddToCartSection product={product} slug={slug} />

              {/* Shipping Info */}
              {product.est_shipping_time > 0 && (
                <div className="flex items-center gap-3 rounded-[8px] border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                  <Truck
                    size={20}
                    className="shrink-0 text-accent"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Estimated delivery:{' '}
                    <strong className="font-semibold text-neutral-900 dark:text-white">
                      {product.est_shipping_time} days
                    </strong>
                  </span>
                </div>
              )}

              {/* Accordion Sections */}
              <ProductAccordion sections={accordionSections} />
            </div>
          </div>
        </div>
        </ProductVariantProvider>

        {/* ---------------------------------------------------------------- */}
        {/*  Below Main Section                                              */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-16 space-y-16 lg:mt-24">
          {/* Product Reviews */}
          <section>
            <ProductReviews productId={product.id} />
          </section>

          {/* Top From Seller */}
          {topFromSeller.length > 0 && (
            <section>
              <SectionHeader title="You May Also Like" />
              <ProductGrid products={topFromSeller} columns={4} />
            </section>
          )}

          {/* Frequently Bought Together */}
          {frequentlyBought.length > 0 && (
            <section>
              <SectionHeader title="Frequently Bought Together" />
              <ProductGrid products={frequentlyBought} columns={4} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

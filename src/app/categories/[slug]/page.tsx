import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { storeConfig } from '@/config/store.config';
import { cn } from '@/lib/utils';
import { getCategoryInfo, getSubCategories, getCategoryMenu } from '@/lib/api/categories';
import { findDepartmentContext } from '@/lib/category-tree';
import { getCategoryProducts } from '@/lib/api/products';
import { CategorySidebar } from '@/components/category/category-sidebar';
import { GroceryCategoryRail } from '@/components/category/grocery/grocery-category-rail';
import { ActiveFilters, SortDropdown } from '@/components/category/active-filters';
import { ProductGrid } from '@/components/product/product-grid';
import { CategoryPagination } from '@/components/category/category-pagination';
import type { SubCategory } from '@/lib/types/category';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort_key?: string;
    min?: string;
    max?: string;
    brands?: string;
    categories?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryInfo(slug);
  const category = Array.isArray(result.data) ? result.data[0] : result.data;

  return {
    title: category?.name ? `${category.name} | ${storeConfig.content.name}` : `Category | ${storeConfig.content.name}`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  // Build filter options from URL search params
  const filters: { brands?: string; min?: number; max?: number; sort_key?: string } = {};
  if (resolvedSearchParams.brands) filters.brands = resolvedSearchParams.brands;
  if (resolvedSearchParams.min) filters.min = Number(resolvedSearchParams.min);
  if (resolvedSearchParams.max) filters.max = Number(resolvedSearchParams.max);
  if (resolvedSearchParams.sort_key) filters.sort_key = resolvedSearchParams.sort_key;

  const isGrocery = storeConfig.headerStyle === 'grocery';

  // Grocery rail shows the ENCLOSING DEPARTMENT's subcategories (siblings),
  // not the current category's children — so from Dairy > Milk you can hop
  // straight to Cheese. Sourced from the cached full menu tree, which also
  // tells us which row to highlight. Fashion doesn't need the tree at all.
  const [categoryResult, productsResult, menuResult] = await Promise.all([
    getCategoryInfo(slug),
    getCategoryProducts(slug, currentPage, Object.keys(filters).length > 0 ? filters : undefined),
    isGrocery
      ? getCategoryMenu().catch(() => ({ success: false, data: [] }))
      : Promise.resolve({ success: false, data: [] }),
  ]);

  const category = Array.isArray(categoryResult.data) ? categoryResult.data[0] : categoryResult.data;
  const products = productsResult.data ?? [];
  const totalPages = productsResult.meta?.last_page ?? 1;

  // Children of the CURRENT category. Still used by the fashion chip row and
  // the "N subcategories available" line. Because /sub-categories/{id} wraps
  // its result in CategoryCollection, these come back with icons at any depth.
  let subCategories: SubCategory[] = [];
  if (category?.id && category.number_of_children > 0) {
    try {
      const subRes = await getSubCategories(category.id);
      if (subRes.data) {
        subCategories = subRes.data;
      }
    } catch {
      // Silently fail
    }
  }

  // Rail contents + which row is current, derived from the menu tree.
  const { items: railItems, activeSlug } = findDepartmentContext(
    menuResult.data ?? [],
    slug,
  );

  // The rail disappears when the tree has nothing for this slug (e.g. a
  // digital-only or unlisted category), letting products run full width.
  const showRail = isGrocery && railItems.length > 0;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Category header — slim bold style */}
      <section className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto py-8 md:py-10">
          <div className="flex items-stretch gap-4">
            {/* Red accent bar */}
            <div className="w-1 bg-accent rounded-full" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-none text-neutral-900 dark:text-white tracking-tight">
                {category?.name ?? 'Category'}
              </h1>
              {subCategories.length > 0 && (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {subCategories.length} subcategor{subCategories.length === 1 ? 'y' : 'ies'} available
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          <Link
            href="/"
            className="transition-all duration-300 hover:text-accent"
          >
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link
            href="/categories"
            className="transition-all duration-300 hover:text-accent"
          >
            Categories
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {category?.name ?? 'Category'}
          </span>
        </nav>
      </div>

      {/* Subcategory chips — fashion only. In grocery these are redundant
          with <GroceryCategoryRail>, which shows the same children as
          image + title tiles. */}
      {!isGrocery && subCategories.length > 0 && (
        <div className="container mx-auto pb-4">
          <div className="category-scrollbar flex gap-2 overflow-x-auto pb-2">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="inline-flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 rounded-full font-display text-[11px] font-semibold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                {sub.name}
                {sub.number_of_children > 0 && (
                  <span className="opacity-60">({sub.number_of_children})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Content: sidebar + product grid */}
      <div className="container mx-auto pb-16">
        {/* Grocery with a rail sits side-by-side at EVERY breakpoint (matching
            /categories). Fashion — and grocery leaf pages with no rail — keep
            the stacked-then-row behaviour. */}
        <div
          className={cn(
            'flex',
            showRail
              ? 'flex-row gap-3 sm:gap-4 lg:gap-8'
              : 'flex-col gap-8 lg:flex-row',
          )}
        >
          {/* Left column.
              Grocery -> image+title rail of this category's children, omitted
              entirely on leaf categories. Fashion -> the pinned filter panel. */}
          {isGrocery ? (
            showRail && (
              <GroceryCategoryRail
                items={railItems}
                title={category?.name}
                activeSlug={activeSlug}
              />
            )
          ) : (
            <CategorySidebar />
          )}

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Results summary + sort.
                Wraps rather than overflows: with the rail present the content
                column is only ~240px wide on a phone. */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {productsResult.meta?.total != null ? (
                  <>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {productsResult.meta.total}
                    </span>{' '}
                    {productsResult.meta.total === 1 ? 'product' : 'products'} found
                  </>
                ) : (
                  <>{products.length} {products.length === 1 ? 'product' : 'products'} found</>
                )}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {/* Grocery has no pinned filter panel, so brand/price live
                    behind this trigger at every breakpoint. */}
                {isGrocery && <CategorySidebar mode="drawer" />}
                <SortDropdown />
              </div>
            </div>

            {/* Active filter pills */}
            <ActiveFilters />

            {/* Product grid */}
            {products.length > 0 ? (
              <ProductGrid products={products} columns={3} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[8px] border border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-700 dark:bg-neutral-900">
                <p className="font-display text-lg font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  No products found
                </p>
                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                  Try adjusting your filters or check back later.
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
        </div>
      </div>
    </main>
  );
}

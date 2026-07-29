import { searchProducts } from '@/lib/api/products';
import { CategorySidebar } from '@/components/category/category-sidebar';
import { ActiveFilters, SortDropdown } from '@/components/category/active-filters';
import { ProductGrid } from '@/components/product/product-grid';
import { CategoryPagination } from '@/components/category/category-pagination';
import type { Metadata } from 'next';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{
    name?: string;
    categories?: string;
    brands?: string;
    sort_key?: string;
    min?: string;
    max?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.name || '';
  return {
    title: query ? `Search results for '${query}'` : 'Search',
    description: query
      ? `Browse search results for '${query}'.`
      : 'Search our product catalog.',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const query = params.name || '';
  const currentPage = params.page ? parseInt(params.page, 10) : 1;

  let products: any[] = [];
  let totalPages = 1;
  let totalResults = 0;

  try {
    const results = await searchProducts({
      name: params.name,
      categories: params.categories,
      brands: params.brands,
      sort_key: params.sort_key,
      min: params.min ? Number(params.min) : undefined,
      max: params.max ? Number(params.max) : undefined,
      page: currentPage,
    });

    products = results?.data || [];
    totalPages = results?.meta?.last_page || 1;
    totalResults = results?.meta?.total || products.length;
  } catch {
    // API error — show empty state
  }

  const hasResults = products.length > 0;

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto py-3">
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link
              href="/"
              className="hover:text-accent transition-all duration-300"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-neutral-900 dark:text-neutral-100">
              Search
            </span>
            {query && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                  {query}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto py-8 md:py-10">
          <div className="flex items-stretch gap-4">
            <div className="w-1 bg-accent rounded-full" />
            <div>
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-none tracking-tight text-neutral-900 dark:text-white">
                {query ? (
                  <>
                    Results for &apos;{query}&apos;
                  </>
                ) : (
                  'Search'
                )}
              </h1>
              {hasResults && (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {totalResults} {totalResults === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        {hasResults ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <CategorySidebar />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Results summary + sort */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {totalResults}
                  </span>{' '}
                  {totalResults === 1 ? 'product' : 'products'} found
                </p>
                <SortDropdown />
              </div>

              {/* Active filter pills */}
              <ActiveFilters />

              <ProductGrid products={products} />

              {totalPages > 1 && (
                <div className="mt-10">
                  <CategoryPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6">
              <Search className="h-9 w-9 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2">
              No products found{query ? ` for '${query}'` : ''}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
              {query
                ? 'Try different keywords or adjust your filters to find what you\'re looking for.'
                : 'Enter a search term to browse our catalog.'}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-[8px] bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

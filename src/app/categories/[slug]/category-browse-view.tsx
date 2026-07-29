'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, ArrowUpDown } from 'lucide-react';
import { ProductGrid } from '@/components/product/product-grid';
import { Pagination } from '@/components/ui/pagination';
import { fetchCategoryInfo } from '@/lib/api/categories';
import { fetchCategoryProducts } from '@/lib/api/products';
import { cn } from '@/lib/utils';
import type { MenuCategory, Category } from '@/lib/types/category';
import type { ProductMini } from '@/lib/types';

interface CategoryBrowseViewProps {
  initialSlug: string;
  initialCategory: Category | null;
  initialProducts: ProductMini[];
  initialTotalPages: number;
  initialTotalProducts: number;
  initialPage: number;
  menuTree: MenuCategory[];
}

interface SidebarItem {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  hasChildren: boolean;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'new_arrival', label: 'Newest' },
  { value: 'price_low_to_high', label: 'Price: Low to High' },
  { value: 'price_high_to_low', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Best Selling' },
  { value: 'top_rated', label: 'Top Rated' },
];

function findChildren(menuTree: MenuCategory[], slug: string): SidebarItem[] {
  for (const cat of menuTree) {
    if (cat.slug === slug) {
      return (cat.children ?? []).map((sub) => ({
        id: sub.id,
        slug: sub.slug,
        name: sub.name,
        icon: sub.icon,
        hasChildren: (sub.children ?? []).length > 0,
      }));
    }
    for (const sub of cat.children ?? []) {
      if (sub.slug === slug) {
        return (sub.children ?? []).map((ss) => ({
          id: ss.id,
          slug: ss.slug,
          name: ss.name,
          icon: null,
          hasChildren: false,
        }));
      }
    }
  }
  return [];
}

function findParent(menuTree: MenuCategory[], slug: string): { slug: string; name: string } | null {
  for (const cat of menuTree) {
    for (const sub of cat.children ?? []) {
      if (sub.slug === slug) return { slug: cat.slug, name: cat.name };
      for (const ss of sub.children ?? []) {
        if (ss.slug === slug) return { slug: sub.slug, name: sub.name };
      }
    }
  }
  return null;
}

export function CategoryBrowseView({
  initialSlug,
  initialCategory,
  initialProducts,
  initialTotalPages,
  initialTotalProducts,
  initialPage,
  menuTree,
}: CategoryBrowseViewProps) {
  const router = useRouter();

  const [parentSlug, setParentSlug] = useState(initialSlug);
  const [parentCategory, setParentCategory] = useState(initialCategory);
  const [activeSlug, setActiveSlug] = useState(() => {
    const kids = findChildren(menuTree, initialSlug);
    return kids.length > 0 ? kids[0].slug : initialSlug;
  });
  const [products, setProducts] = useState<ProductMini[]>(initialProducts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [page, setPage] = useState(initialPage);
  const [sortKey, setSortKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const children = useMemo(() => findChildren(menuTree, parentSlug), [menuTree, parentSlug]);
  const hasChildren = children.length > 0;
  const parentInfo = useMemo(() => findParent(menuTree, parentSlug), [menuTree, parentSlug]);

  const fetchProducts = useCallback(
    async (targetSlug: string, fetchPage: number, fetchSort?: string) => {
      setIsLoading(true);
      try {
        const [prodRes] = await Promise.all([
          fetchCategoryProducts(targetSlug, fetchPage, fetchSort),
        ]);
        const newProducts = (prodRes.data ?? []) as ProductMini[];
        setProducts(newProducts);
        setTotalPages(prodRes.meta?.last_page ?? 1);
        setTotalProducts(prodRes.meta?.total ?? newProducts.length);
      } catch {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const drillDown = useCallback(
    async (newParentSlug: string) => {
      const kids = findChildren(menuTree, newParentSlug);
      const firstChild = kids.length > 0 ? kids[0].slug : newParentSlug;

      setParentSlug(newParentSlug);
      setActiveSlug(firstChild);
      setPage(1);
      setSortKey('');
      setIsLoading(true);

      router.replace(`/categories/${newParentSlug}`, { scroll: false });

      try {
        const [catRes, prodRes] = await Promise.all([
          fetchCategoryInfo(newParentSlug),
          fetchCategoryProducts(firstChild, 1),
        ]);
        setParentCategory((Array.isArray(catRes.data) ? catRes.data[0] : catRes.data) ?? null);
        const newProducts = (prodRes.data ?? []) as ProductMini[];
        setProducts(newProducts);
        setTotalPages(prodRes.meta?.last_page ?? 1);
        setTotalProducts(prodRes.meta?.total ?? newProducts.length);
      } catch {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    },
    [menuTree, router],
  );

  const selectChild = useCallback(
    async (childSlug: string) => {
      setActiveSlug(childSlug);
      setPage(1);
      setSortKey('');
      fetchProducts(childSlug, 1);
    },
    [fetchProducts],
  );

  const handleSidebarClick = useCallback(
    (item: SidebarItem) => {
      if (item.hasChildren) {
        drillDown(item.slug);
      } else {
        selectChild(item.slug);
      }
    },
    [drillDown, selectChild],
  );

  const handleBackToParent = useCallback(() => {
    if (parentInfo) {
      drillDown(parentInfo.slug);
    }
  }, [parentInfo, drillDown]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchProducts(activeSlug, newPage, sortKey || undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [activeSlug, sortKey, fetchProducts],
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value;
      setSortKey(newSort);
      setPage(1);
      fetchProducts(activeSlug, 1, newSort || undefined);
    },
    [activeSlug, fetchProducts],
  );

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Category header */}
      <section className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto py-8 md:py-10">
          <div className="flex items-stretch gap-4">
            <div className="w-1 bg-accent rounded-full" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-none text-neutral-900 dark:text-white tracking-tight">
                {parentCategory?.name ?? 'Category'}
              </h1>
              {hasChildren && (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {children.length} subcategor{children.length === 1 ? 'y' : 'ies'} available
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="container mx-auto py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          <Link href="/" className="transition-all duration-300 hover:text-accent">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/categories" className="transition-all duration-300 hover:text-accent">
            Categories
          </Link>
          {parentInfo && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              <button onClick={handleBackToParent} className="transition-all duration-300 hover:text-accent">
                {parentInfo.name}
              </button>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {parentCategory?.name ?? 'Category'}
          </span>
        </nav>
      </div>

      {/* Content: sidebar + product grid */}
      <div className="container mx-auto pb-16">
        <div className="flex border-t border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-20rem)]">
          {/* ============================================================ */}
          {/*  LEFT RAIL — subcategories (grocery style)                   */}
          {/* ============================================================ */}
          {hasChildren && (
            <nav
              className={cn(
                'w-[92px] shrink-0 overflow-y-auto sm:w-[120px] lg:w-[200px]',
                'border-r border-neutral-200 bg-neutral-50/60',
                'dark:border-neutral-800 dark:bg-neutral-900/40',
              )}
              aria-label="Subcategories"
            >
              {/* Back to parent */}
              {parentInfo && (
                <button
                  onClick={handleBackToParent}
                  className={cn(
                    'flex w-full items-center gap-1 px-2 py-3',
                    'border-l-[3px] border-transparent',
                    'text-neutral-500 hover:bg-white dark:hover:bg-neutral-900 transition-colors',
                  )}
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] font-medium lg:text-xs line-clamp-1">
                    {parentInfo.name}
                  </span>
                </button>
              )}

              {children.map((item) => {
                const isActive = item.slug === activeSlug;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSidebarClick(item)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'flex w-full flex-col items-center gap-1 px-1.5 py-3 lg:flex-row lg:gap-2.5 lg:px-3',
                      'border-l-[3px] transition-colors',
                      isActive
                        ? 'border-accent bg-accent-light dark:bg-accent/10'
                        : 'border-transparent hover:bg-white dark:hover:bg-neutral-900',
                    )}
                  >
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white dark:bg-neutral-800">
                      {item.icon ? (
                        <Image
                          src={item.icon}
                          alt=""
                          fill
                          className="object-contain p-1"
                          sizes="36px"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-accent">
                          {item.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        'line-clamp-2 text-center text-[10px] font-medium leading-tight lg:text-left lg:text-xs',
                        isActive
                          ? 'text-accent-dark dark:text-accent'
                          : 'text-neutral-600 dark:text-neutral-400',
                      )}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* ============================================================ */}
          {/*  RIGHT AREA — products                                       */}
          {/* ============================================================ */}
          <div className={cn('min-w-0 flex-1 p-3 sm:p-4 lg:p-6', !hasChildren && 'w-full')}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {totalProducts}
                </span>{' '}
                {totalProducts === 1 ? 'product' : 'products'} found
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-neutral-400" />
                <select
                  value={sortKey}
                  onChange={handleSortChange}
                  className="appearance-none bg-transparent text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer focus:outline-none pr-1"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <ProductGrid products={[]} columns={3} isLoading />
            ) : products.length > 0 ? (
              <ProductGrid products={products} columns={hasChildren ? 3 : 4} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[8px] border border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-700 dark:bg-neutral-900">
                <p className="font-display text-lg font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  No products found
                </p>
                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                  Try selecting a different category.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

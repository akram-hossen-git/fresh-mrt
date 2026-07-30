'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, X, SlidersHorizontal, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getFilterCategories, getFilterBrands } from '@/lib/api/filters';
import type { FilterCategory, Brand } from '@/lib/api/filters';

interface CategorySidebarProps {
  initialCategories?: FilterCategory[];
  initialBrands?: Brand[];
  /**
   * 'sidebar' (default) — pinned panel from `lg` up, drawer below it.
   *   Used by the fashion/standard listing pages.
   * 'drawer'  — no pinned panel at any breakpoint; the Filters trigger and
   *   drawer are always shown. Used by the grocery listing page, where the
   *   left column is occupied by <GroceryCategoryRail> instead.
   */
  mode?: 'sidebar' | 'drawer';
}

type SortOption = 'new_arrival' | 'price_low_to_high' | 'price_high_to_low' | 'popularity' | 'top_rated';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'new_arrival', label: 'Newest' },
  { value: 'price_low_to_high', label: 'Price: Low to High' },
  { value: 'price_high_to_low', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Best Selling' },
  { value: 'top_rated', label: 'Top Rated' },
];

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 py-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between font-display text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
      >
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-500 transition-all duration-300',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'mt-3 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}

function FilterContent({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  minPrice,
  maxPrice,
  sortBy,
  onToggleCategory,
  onToggleBrand,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onApply,
  onClear,
}: {
  categories: FilterCategory[];
  brands: Brand[];
  selectedCategories: Set<string>;
  selectedBrands: Set<string>;
  minPrice: string;
  maxPrice: string;
  sortBy: SortOption;
  onToggleCategory: (slug: string) => void;
  onToggleBrand: (slug: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedBrands.size > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sortBy !== 'new_arrival';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Categories */}
        <CollapsibleSection title="Categories">
          <ul className="space-y-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.has(String(category.id));
              return (
                <li key={category.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 group">
                    <span
                      className={cn(
                        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-all duration-300',
                        isSelected
                          ? 'border-accent bg-accent'
                          : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800 group-hover:border-accent'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onToggleCategory(String(category.id))}
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-all duration-300">
                      {category.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </CollapsibleSection>

        {/* Brands */}
        <CollapsibleSection title="Brands">
          <ul className="space-y-2">
            {brands.map((brand) => {
              const isSelected = selectedBrands.has(String(brand.id));
              return (
                <li key={brand.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 group">
                    <span
                      className={cn(
                        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-all duration-300',
                        isSelected
                          ? 'border-accent bg-accent'
                          : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800 group-hover:border-accent'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onToggleBrand(String(brand.id))}
                    />
                    <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-[4px]">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        sizes="20px"
                      />
                    </span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-all duration-300">
                      {brand.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </CollapsibleSection>

        {/* Price Range */}
        <CollapsibleSection title="Price Range">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              min={0}
              size="sm"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
            />
            <span className="text-neutral-400 dark:text-neutral-500 text-sm shrink-0">&mdash;</span>
            <Input
              type="number"
              placeholder="Max"
              min={0}
              size="sm"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
            />
          </div>
        </CollapsibleSection>

        {/* Sort By */}
        <CollapsibleSection title="Sort By">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full h-9 rounded-[8px] border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-all duration-300 focus:border-accent focus:ring-1 focus:ring-accent dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </CollapsibleSection>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <Button
          variant="accent"
          fullWidth
          onClick={onApply}
        >
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-neutral-500 hover:text-accent transition-all duration-300"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

export function CategorySidebar({
  initialCategories,
  initialBrands,
  mode = 'sidebar',
}: CategorySidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // In drawer mode nothing is pinned, so the trigger and overlay must not be
  // hidden at `lg`. Collected here so every breakpoint rule stays in one place.
  const isDrawerMode = mode === 'drawer';
  const pinnedClass = isDrawerMode ? 'hidden' : 'hidden lg:block';
  const triggerClass = isDrawerMode ? '' : 'lg:hidden';
  const overlayClass = isDrawerMode ? '' : 'lg:hidden';

  const [categories, setCategories] = useState<FilterCategory[]>(initialCategories ?? []);
  const [brands, setBrands] = useState<Brand[]>(initialBrands ?? []);
  const [isLoading, setIsLoading] = useState(!initialCategories || !initialBrands);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Read current filter state from URL search params
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    const param = searchParams.get('categories');
    return param ? new Set(param.split(',')) : new Set<string>();
  });

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(() => {
    const param = searchParams.get('brands');
    return param ? new Set(param.split(',')) : new Set<string>();
  });

  const [minPrice, setMinPrice] = useState(() => searchParams.get('min') ?? '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('max') ?? '');
  const [sortBy, setSortBy] = useState<SortOption>(
    () => (searchParams.get('sort_key') as SortOption) || 'new_arrival'
  );

  // Fetch data on mount if not provided as initial props
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [catResult, brandResult] = await Promise.all([
          initialCategories ? Promise.resolve(null) : getFilterCategories(),
          initialBrands ? Promise.resolve(null) : getFilterBrands(),
        ]);

        if (!cancelled) {
          if (catResult) setCategories(catResult.data ?? []);
          if (brandResult) setBrands(brandResult.data ?? []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (!initialCategories || !initialBrands) {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [initialCategories, initialBrands]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const toggleBrand = useCallback((slug: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();

    // Preserve the 'name' param if present (search page)
    const currentName = searchParams.get('name');
    if (currentName) {
      params.set('name', currentName);
    }

    if (selectedCategories.size > 0) {
      params.set('categories', Array.from(selectedCategories).join(','));
    }
    if (selectedBrands.size > 0) {
      params.set('brands', Array.from(selectedBrands).join(','));
    }
    if (minPrice !== '') {
      params.set('min', minPrice);
    }
    if (maxPrice !== '') {
      params.set('max', maxPrice);
    }
    if (sortBy !== 'new_arrival') {
      params.set('sort_key', sortBy);
    }

    const queryString = params.toString();
    const path = window.location.pathname;
    router.push(queryString ? `${path}?${queryString}` : path);
    setMobileOpen(false);
  }, [selectedCategories, selectedBrands, minPrice, maxPrice, sortBy, router, searchParams]);

  const clearAll = useCallback(() => {
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setMinPrice('');
    setMaxPrice('');
    setSortBy('new_arrival');

    // Preserve the 'name' param if present (search page)
    const currentName = searchParams.get('name');
    const path = window.location.pathname;
    if (currentName) {
      router.push(`${path}?name=${encodeURIComponent(currentName)}`);
    } else {
      router.push(path);
    }
    setMobileOpen(false);
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <aside className={cn(pinnedClass, 'w-64 shrink-0')}>
          <div className="rounded-[8px] border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-3 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-3 w-5/6 rounded bg-neutral-100 dark:bg-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile trigger (disabled while loading) */}
        <div className={triggerClass}>
          <Button
            disabled
            variant="outline"
            className="rounded-[8px] border-neutral-300 dark:border-neutral-600"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </>
    );
  }

  const filterContentProps = {
    categories,
    brands,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    sortBy,
    onToggleCategory: toggleCategory,
    onToggleBrand: toggleBrand,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    onSortChange: setSortBy,
    onApply: applyFilters,
    onClear: clearAll,
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(pinnedClass, 'w-64 shrink-0')}>
        <div className="sticky top-4 rounded-[8px] border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="mb-1 font-display text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            Filters
          </h2>
          <FilterContent {...filterContentProps} />
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className={triggerClass}>
        <Button
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="rounded-[8px] border-neutral-300 dark:border-neutral-600"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {(selectedCategories.size > 0 ||
            selectedBrands.size > 0 ||
            minPrice !== '' ||
            maxPrice !== '') && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {selectedCategories.size + selectedBrands.size + (minPrice || maxPrice ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className={cn('fixed inset-0 z-50', overlayClass)}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-all duration-300"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm">
            <div className="relative flex w-full flex-col bg-white shadow-xl dark:bg-neutral-900 transition-all duration-300">
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close filters</span>
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-5 py-2">
                <FilterContent {...filterContentProps} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

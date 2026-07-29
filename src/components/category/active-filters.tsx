'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { X, ArrowUpDown } from 'lucide-react';

const SORT_LABELS: Record<string, string> = {
  new_arrival: 'Newest',
  price_low_to_high: 'Price: Low to High',
  price_high_to_low: 'Price: High to Low',
  popularity: 'Best Selling',
  top_rated: 'Top Rated',
};

interface ActiveFiltersProps {
  brandNames?: Record<string, string>;
  categoryNames?: Record<string, string>;
}

export function ActiveFilters({ brandNames, categoryNames }: ActiveFiltersProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const brands = searchParams.get('brands');
  const categories = searchParams.get('categories');
  const min = searchParams.get('min');
  const max = searchParams.get('max');
  const sortKey = searchParams.get('sort_key');

  const pills: { label: string; paramKey: string }[] = [];

  if (brands) {
    brands.split(',').forEach((b) => {
      const name = brandNames?.[b] || `Brand #${b}`;
      pills.push({ label: name, paramKey: `brands:${b}` });
    });
  }
  if (categories) {
    categories.split(',').forEach((c) => {
      const name = categoryNames?.[c] || `Category #${c}`;
      pills.push({ label: name, paramKey: `categories:${c}` });
    });
  }
  if (min && max) {
    pills.push({ label: `$${min} – $${max}`, paramKey: 'price_range' });
  } else if (min) {
    pills.push({ label: `From $${min}`, paramKey: 'min' });
  } else if (max) {
    pills.push({ label: `Up to $${max}`, paramKey: 'max' });
  }
  if (sortKey && sortKey !== 'new_arrival') {
    pills.push({ label: SORT_LABELS[sortKey] || sortKey, paramKey: 'sort_key' });
  }

  if (pills.length === 0) return null;

  const removePill = (paramKey: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (paramKey === 'price_range') {
      params.delete('min');
      params.delete('max');
    } else if (paramKey.startsWith('brands:')) {
      const id = paramKey.split(':')[1];
      const current = params.get('brands')?.split(',').filter((b) => b !== id) ?? [];
      if (current.length > 0) {
        params.set('brands', current.join(','));
      } else {
        params.delete('brands');
      }
    } else if (paramKey.startsWith('categories:')) {
      const id = paramKey.split(':')[1];
      const current = params.get('categories')?.split(',').filter((c) => c !== id) ?? [];
      if (current.length > 0) {
        params.set('categories', current.join(','));
      } else {
        params.delete('categories');
      }
    } else {
      params.delete(paramKey);
    }

    // Reset to page 1 when removing filters
    params.delete('page');

    const queryString = params.toString();
    const path = window.location.pathname;
    router.push(queryString ? `${path}?${queryString}` : path);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    // Keep only 'name' if on search page
    const name = searchParams.get('name');
    if (name) params.set('name', name);

    const queryString = params.toString();
    const path = window.location.pathname;
    router.push(queryString ? `${path}?${queryString}` : path);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {pills.map((pill) => (
        <span
          key={pill.paramKey}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
        >
          {pill.label}
          <button
            onClick={() => removePill(pill.paramKey)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label={`Remove filter: ${pill.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {pills.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs text-neutral-500 hover:text-accent dark:hover:text-accent underline underline-offset-2 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export function SortDropdown() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get('sort_key') || 'new_arrival';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;

    if (value === 'new_arrival') {
      params.delete('sort_key');
    } else {
      params.set('sort_key', value);
    }
    // Reset to page 1 when changing sort
    params.delete('page');

    const queryString = params.toString();
    const path = window.location.pathname;
    router.push(queryString ? `${path}?${queryString}` : path);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-neutral-400 hidden sm:block" />
      <select
        value={currentSort}
        onChange={handleChange}
        className="appearance-none bg-transparent text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer focus:outline-none pr-1"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

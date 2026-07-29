'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Tag, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { apiFetch } from '@/lib/api-client';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchCategory {
  id: number;
  slug: string;
  name: string;
  level: string;
  banner: string | null;
  cover_image: string | null;
  icon: string | null;
}

interface SearchProduct {
  id: number;
  slug: string;
  name: string;
  thumbnail_image: string;
  main_price: string;
  stroked_price: string;
  has_discount: boolean;
  rating: number;
}

interface RichSearchResults {
  categories: SearchCategory[];
  products: SearchProduct[];
}

export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RichSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  /* ---- Fetch rich results when debounced query changes ---- */
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    apiFetch<{ success: boolean; data: RichSearchResults }>(
      `/search/rich?query=${encodeURIComponent(debouncedQuery)}`
    )
      .then((res) => {
        if (!cancelled && res.data) {
          setResults(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) setResults(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  /* ---- Focus input when overlay opens ---- */
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
    setQuery('');
    setResults(null);
  }, [isOpen]);

  /* ---- Close on Escape ---- */
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const navigate = useCallback(
    (term: string) => {
      if (!term.trim()) return;
      router.push(`/search?name=${encodeURIComponent(term.trim())}`);
      onClose();
    },
    [router, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(query);
    }
  };

  const handleLinkClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  const hasCategories = results && results.categories.length > 0;
  const hasProducts = results && results.products.length > 0;
  const hasResults = hasCategories || hasProducts;

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Search panel */}
      <div className="relative w-full bg-white dark:bg-neutral-900 shadow-2xl animate-slide-down max-h-[85vh] overflow-hidden flex flex-col">
        <div className="container mx-auto py-6 flex flex-col max-h-full">
          {/* Input row */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Search
              size={24}
              className="shrink-0 text-neutral-400"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for products, categories..."
              className={cn(
                'flex-1 bg-transparent text-lg md:text-xl font-light outline-none',
                'text-neutral-900 dark:text-white',
                'placeholder:text-neutral-400',
              )}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="shrink-0 p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="shrink-0 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="Close search"
            >
              <X size={24} />
            </button>
          </div>

          {/* Loading indicator */}
          {isLoading && debouncedQuery.length >= 2 && (
            <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4 flex-shrink-0">
              <div className="flex items-center gap-3 px-4 text-sm text-neutral-500">
                <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-600 dark:border-t-neutral-300 rounded-full animate-spin" />
                Searching...
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && hasResults && (
            <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4 overflow-y-auto flex-1">
              {/* Categories section */}
              {hasCategories && (
                <div className="mb-6">
                  <div className="flex items-center justify-between px-4 mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Categories
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 px-4">
                    {results!.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
                      >
                        {/* Category image */}
                        {(cat.cover_image || cat.banner || cat.icon) ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                            <Image
                              src={cat.cover_image || cat.banner || cat.icon || ''}
                              alt={cat.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Grid3X3 size={20} className="text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate group-hover:text-black dark:group-hover:text-white">
                            {cat.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {cat.level}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products section */}
              {hasProducts && (
                <div>
                  <div className="flex items-center justify-between px-4 mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Products
                    </h3>
                    <button
                      onClick={() => navigate(query)}
                      className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                      View all <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4 pb-4">
                    {results!.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={handleLinkClick}
                        className="group flex flex-col rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-md transition-all"
                      >
                        {/* Product image */}
                        <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-800">
                          <Image
                            src={product.thumbnail_image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                          {product.has_discount && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                              Sale
                            </span>
                          )}
                        </div>
                        {/* Product info */}
                        <div className="p-2.5 flex flex-col gap-1">
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-tight font-medium">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-auto">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {product.main_price}
                            </span>
                            {product.has_discount && (
                              <span className="text-[11px] text-neutral-400 line-through">
                                {product.stroked_price}
                              </span>
                            )}
                          </div>
                          {product.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500 text-[11px]">★</span>
                              <span className="text-[11px] text-neutral-500">{product.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {!isLoading && debouncedQuery.length >= 2 && !hasResults && results !== null && (
            <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-6 pb-4 text-center">
              <Tag size={32} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                No results found for &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Try different keywords or browse categories
              </p>
            </div>
          )}

          {/* Quick search hint when empty */}
          {!debouncedQuery && (
            <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4 flex-shrink-0">
              <p className="px-4 text-xs text-neutral-400 dark:text-neutral-500">
                Type at least 2 characters to search products and categories
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

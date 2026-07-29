'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Grid3X3, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuCategory } from '@/lib/types/category';

interface MegaMenuProps {
  categories: MenuCategory[];
  /** Trigger style: 'standard' = fashion text link, 'grocery' = icon + white text for green bar */
  variant?: 'standard' | 'grocery';
}

export function MegaMenu({ categories, variant = 'standard' }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [activeCategory, categories]);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!categories || categories.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <button
        className={cn(
          'flex items-center gap-1.5 py-2 font-semibold transition-colors',
          variant === 'grocery'
            ? 'text-sm text-white/90 hover:text-white hover:bg-white/10 px-3 rounded-[var(--radius-button)]'
            : 'font-display text-sm uppercase tracking-[0.1em] text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white',
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {variant === 'grocery' && <Menu size={16} className="shrink-0" />}
        {variant === 'grocery' ? 'All Departments' : 'Categories'}
        <ChevronRight
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            open && 'rotate-90'
          )}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          'fixed left-0 right-0 top-[calc(var(--header-height,80px))] z-50',
          'bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800',
          'shadow-2xl shadow-black/5 dark:shadow-black/30',
          'transition-all duration-200 ease-out',
          open
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-2 pointer-events-none'
        )}
      >
        <div className="max-w-7xl mx-auto flex min-h-[400px] max-h-[70vh]">
          {/* Left: Category list */}
          <div className="w-64 border-r border-neutral-100 dark:border-neutral-800 py-4 overflow-y-auto flex-shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onMouseEnter={() => setActiveCategory(cat)}
                className={cn(
                  'flex w-full items-center gap-3 px-5 py-2.5 text-left font-sans text-sm transition-all duration-150',
                  activeCategory?.id === cat.id
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-black dark:hover:text-white'
                )}
              >
                {cat.icon ? (
                  <Image
                    src={cat.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-sm object-contain flex-shrink-0"
                  />
                ) : (
                  <Grid3X3 className="h-4 w-4 flex-shrink-0 opacity-50" />
                )}
                <span className="truncate">{cat.name}</span>
                {cat.children.length > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-40 flex-shrink-0" />
                )}
              </button>
            ))}

            {/* View all link */}
            <Link
              href="/categories"
              className="mt-2 flex w-full items-center gap-3 border-t border-neutral-100 px-5 pb-2.5 pt-4 text-left font-display text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500 transition-colors hover:text-black dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white"
              onClick={() => setOpen(false)}
            >
              View All Categories
            </Link>
          </div>

          {/* Center: Sub-categories */}
          <div className="flex-1 py-4 px-6 overflow-y-auto">
            {activeCategory && (
              <div>
                <Link
                  href={`/categories/${activeCategory.slug}`}
                  className="font-display text-sm font-semibold uppercase tracking-[0.06em] text-black dark:text-white hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {activeCategory.name}
                </Link>

                {activeCategory.children.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-5">
                    {activeCategory.children.map((sub) => (
                      <div key={sub.id}>
                        <Link
                          href={`/categories/${sub.slug}`}
                          className="font-sans text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-black dark:hover:text-white hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          {sub.name}
                        </Link>

                        {sub.children.length > 0 && (
                          <ul className="mt-1.5 space-y-1">
                            {sub.children.map((subsub) => (
                              <li key={subsub.id}>
                                <Link
                                  href={`/categories/${subsub.slug}`}
                                  className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                                  onClick={() => setOpen(false)}
                                >
                                  {subsub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-neutral-400">
                    No subcategories
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: Banner/cover image */}
          {activeCategory && (activeCategory.banner || activeCategory.cover_image) && (
            <div className="w-64 flex-shrink-0 p-4 flex items-center justify-center">
              <Link
                href={`/categories/${activeCategory.slug}`}
                className="block w-full h-full relative rounded-xl overflow-hidden group"
                onClick={() => setOpen(false)}
              >
                <Image
                  src={activeCategory.cover_image || activeCategory.banner || ''}
                  alt={activeCategory.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium">
                  Shop {activeCategory.name}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

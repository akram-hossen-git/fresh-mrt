'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, HomeCategory } from '@/lib/types';

interface CategoryBarProps {
  categories: (Category | HomeCategory)[];
}

function getCategoryHref(category: Category | HomeCategory): string {
  if ('slug' in category) return `/categories/${category.slug}`;
  const slug = category.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `/categories/${slug}`;
}

function getCategoryImage(category: Category | HomeCategory): string | null {
  if ('icon' in category && category.icon) return category.icon;
  if ('banner' in category && category.banner) return category.banner;
  return null;
}

export function CategoryBar({ categories }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, categories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!categories.length) return null;

  return (
    <div className="relative group/bar">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="category-scrollbar flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 py-2 md:px-0"
      >
        {categories.map((category, index) => {
          const href = getCategoryHref(category);
          const image = getCategoryImage(category);

          return (
            <Link
              key={index}
              href={href}
              className="flex flex-col items-center gap-2 shrink-0 snap-start group"
            >
              {/* Circular image */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-2 ring-transparent group-hover:ring-accent transition-all duration-300">
                {image ? (
                  <Image
                    src={image}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800">
                    <span className="text-lg font-display font-bold text-neutral-500 dark:text-neutral-400">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center whitespace-nowrap max-w-[5rem] truncate">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10',
            'hidden md:flex items-center justify-center',
            'w-9 h-9 rounded-full bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-700',
            'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white',
            'transition-opacity duration-200',
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10',
            'hidden md:flex items-center justify-center',
            'w-9 h-9 rounded-full bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-700',
            'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white',
            'transition-opacity duration-200',
          )}
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Keep the scrollbar visible so horizontal content is discoverable. */}
      <style jsx global>{`
        .category-scrollbar {
          scrollbar-color: rgb(163 163 163) transparent;
          scrollbar-width: thin;
        }
        .category-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .category-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .category-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(163 163 163);
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}

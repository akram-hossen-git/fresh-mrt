'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, X, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuCategory, MenuSubCategory } from '@/lib/types/category';

interface MobileCategoryDrawerProps {
  categories: MenuCategory[];
  isOpen: boolean;
  onClose: () => void;
}

type Layer = 'root' | 'sub' | 'subsub';

export function MobileCategoryDrawer({ categories, isOpen, onClose }: MobileCategoryDrawerProps) {
  const [layer, setLayer] = useState<Layer>('root');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<MenuSubCategory | null>(null);

  const handleCategoryClick = (cat: MenuCategory) => {
    if (cat.children.length > 0) {
      setActiveCategory(cat);
      setLayer('sub');
    }
  };

  const handleSubCategoryClick = (sub: MenuSubCategory) => {
    if (sub.children.length > 0) {
      setActiveSubCategory(sub);
      setLayer('subsub');
    }
  };

  const handleBack = () => {
    if (layer === 'subsub') {
      setLayer('sub');
      setActiveSubCategory(null);
    } else if (layer === 'sub') {
      setLayer('root');
      setActiveCategory(null);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setLayer('root');
      setActiveCategory(null);
      setActiveSubCategory(null);
    }, 300);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-[61] w-full max-w-sm bg-white font-sans shadow-xl transition-transform duration-300 ease-out flex flex-col dark:bg-neutral-900',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          {layer === 'sub' && activeCategory ? (
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={handleBack}
                className="flex shrink-0 items-center gap-1.5 font-display text-base font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <span className="truncate font-display text-base font-semibold uppercase tracking-[0.06em] text-neutral-900 dark:text-white">
                {activeCategory.name}
              </span>
            </div>
          ) : layer === 'subsub' && activeSubCategory ? (
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={handleBack}
                className="flex shrink-0 items-center gap-1.5 font-display text-base font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <span className="truncate font-display text-base font-semibold uppercase tracking-[0.06em] text-neutral-900 dark:text-white">
                {activeSubCategory.name}
              </span>
            </div>
          ) : layer !== 'root' ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 font-display text-base font-semibold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <span className="font-display text-base font-semibold uppercase tracking-[0.06em] text-neutral-900 dark:text-white">Categories</span>
          )}

          <button
            onClick={handleClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Banner for active category */}
        {layer === 'sub' && activeCategory?.banner && (
          <div className="relative h-28 w-full flex-shrink-0 overflow-hidden">
            <Image
              src={activeCategory.banner}
              alt={activeCategory.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-3 left-4 text-white text-base font-semibold">
              {activeCategory.name}
            </span>
          </div>
        )}

        {/* Content layers */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Layer: Root categories */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto transition-transform duration-300',
              layer === 'root' ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <nav className="py-2">
              {categories.map((cat) => (
                <div key={cat.id}>
                  {cat.children.length > 0 ? (
                      <button
                        onClick={() => handleCategoryClick(cat)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-base text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                      {cat.icon ? (
                        <Image src={cat.icon} alt="" width={20} height={20} className="rounded-sm object-contain" />
                      ) : (
                        <Grid3X3 className="h-4 w-4 opacity-50" />
                      )}
                      <span className="flex-1">{cat.name}</span>
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                      </button>
                  ) : (
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-3 text-base text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      onClick={handleClose}
                    >
                      {cat.icon ? (
                        <Image src={cat.icon} alt="" width={20} height={20} className="rounded-sm object-contain" />
                      ) : (
                        <Grid3X3 className="h-4 w-4 opacity-50" />
                      )}
                      <span>{cat.name}</span>
                    </Link>
                  )}
                </div>
              ))}

              <Link
                href="/categories"
                className="mt-2 flex items-center gap-3 border-t border-neutral-100 px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.06em] text-neutral-500 transition-colors hover:text-black dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white"
                onClick={handleClose}
              >
                View All Categories
              </Link>
            </nav>
          </div>

          {/* Layer: Sub-categories */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto transition-transform duration-300',
              layer === 'sub' ? 'translate-x-0' : layer === 'subsub' ? '-translate-x-full' : 'translate-x-full'
            )}
          >
            {activeCategory && (
              <nav className="py-2">
                {/* "View all" for this category */}
                <Link
                  href={`/categories/${activeCategory.slug}`}
                  className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 font-display text-base font-semibold text-neutral-900 dark:border-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  onClick={handleClose}
                >
                  All {activeCategory.name}
                </Link>

                {activeCategory.children.map((sub) => (
                  <div key={sub.id} className="flex items-center">
                    {sub.children.length > 0 ? (
                      <button
                        onClick={() => handleSubCategoryClick(sub)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-base text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        {sub.icon ? (
                          <Image src={sub.icon} alt="" width={18} height={18} className="rounded-sm object-contain" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                        )}
                        <span className="flex-1">{sub.name}</span>
                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                      </button>
                    ) : (
                      <Link
                        href={`/categories/${sub.slug}`}
                        className="flex flex-1 items-center gap-3 px-4 py-3 text-base text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        onClick={handleClose}
                      >
                        {sub.icon ? (
                          <Image src={sub.icon} alt="" width={18} height={18} className="rounded-sm object-contain" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                        )}
                        <span>{sub.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* Layer: Sub-sub-categories */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto transition-transform duration-300',
              layer === 'subsub' ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            {activeSubCategory && (
              <nav className="py-2">
                <Link
                  href={`/categories/${activeSubCategory.slug}`}
                  className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 font-display text-base font-semibold text-neutral-900 dark:border-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  onClick={handleClose}
                >
                  All {activeSubCategory.name}
                </Link>

                {activeSubCategory.children.map((subsub) => (
                  <Link
                    key={subsub.id}
                    href={`/categories/${subsub.slug}`}
                    className="flex items-center gap-3 px-4 py-3 text-base text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    onClick={handleClose}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    <span>{subsub.name}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

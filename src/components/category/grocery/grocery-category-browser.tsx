'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuCategory, MenuSubCategory } from '@/lib/types/category';

/* ------------------------------------------------------------------ */
/*  Grocery Category Browser (two-pane)                                */
/*                                                                     */
/*  Locked wireframe (2026-07-28):                                     */
/*    Left rail  = departments with cat.icon; active gets a green       */
/*                 left border + accent tint.                          */
/*    Right pane = 2-col image tiles for subcategories, using           */
/*                 sub.icon || sub.cover_image, plus an "All {Dept}"    */
/*                 banner on top using cat.cover_image.                */
/*    Tapping a department swaps the right pane instantly — no          */
/*    navigation. Tapping a tile goes to /categories/[slug].            */
/*    Stops at 2 levels; the 3rd level becomes filter chips on the      */
/*    listing page.                                                    */
/*                                                                     */
/*  Grocery-only. Fashion keeps the sliding MobileCategoryDrawer.       */
/* ------------------------------------------------------------------ */

interface GroceryCategoryBrowserProps {
  categories: MenuCategory[];
}

/** Deterministic accent tint so image-less tiles still look intentional. */
function fallbackTint(seed: number): string {
  const tints = [
    'from-accent/20 to-accent/5',
    'from-amber-200/50 to-amber-50',
    'from-sky-200/50 to-sky-50',
    'from-rose-200/50 to-rose-50',
    'from-violet-200/50 to-violet-50',
    'from-emerald-200/50 to-emerald-50',
  ];
  return tints[seed % tints.length];
}

function SubCategoryTile({
  sub,
  index,
}: {
  sub: MenuSubCategory;
  index: number;
}) {
  const image = sub.icon || sub.cover_image || null;

  return (
    <Link
      href={`/categories/${sub.slug}`}
      className="group flex flex-col items-center gap-1.5 text-center"
    >
      <div
        className={cn(
          'relative aspect-square w-full overflow-hidden',
          'rounded-[var(--radius-card)]',
          'bg-gradient-to-br',
          !image && fallbackTint(index),
          image && 'bg-neutral-50 dark:bg-neutral-900',
        )}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, 15vw"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center px-1 text-[11px] font-bold uppercase tracking-wide text-accent-dark">
            {sub.name.slice(0, 2)}
          </span>
        )}
      </div>
      <span className="line-clamp-2 text-[11px] font-medium leading-tight text-neutral-700 dark:text-neutral-300 group-hover:text-accent">
        {sub.name}
      </span>
    </Link>
  );
}

export function GroceryCategoryBrowser({ categories }: GroceryCategoryBrowserProps) {
  const [activeId, setActiveId] = useState<number | null>(
    categories.length > 0 ? categories[0].id : null,
  );

  const active = useMemo(
    () => categories.find((c) => c.id === activeId) ?? categories[0] ?? null,
    [categories, activeId],
  );

  if (categories.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
        No categories available at the moment.
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] border-t border-neutral-200 dark:border-neutral-800">
      {/* ============================================================ */}
      {/*  LEFT RAIL — departments                                     */}
      {/* ============================================================ */}
      <nav
        className={cn(
          'w-[92px] shrink-0 overflow-y-auto sm:w-[120px] lg:w-[200px]',
          'border-r border-neutral-200 bg-neutral-50/60',
          'dark:border-neutral-800 dark:bg-neutral-900/40',
        )}
        aria-label="Departments"
      >
        {categories.map((cat) => {
          const isActive = active?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveId(cat.id)}
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
                {cat.icon ? (
                  <Image
                    src={cat.icon}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="36px"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-accent">
                    {cat.name.slice(0, 1)}
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
                {cat.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ============================================================ */}
      {/*  RIGHT PANE — subcategory tiles                              */}
      {/* ============================================================ */}
      <div className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {active && (
          <>
            {/* "All {Dept}" banner */}
            <Link
              href={`/categories/${active.slug}`}
              className="group relative mb-4 flex h-24 items-center overflow-hidden rounded-[var(--radius-card)] bg-accent-light sm:h-28 dark:bg-accent/10"
            >
              {(active.cover_image || active.banner) && (
                <Image
                  src={active.cover_image || active.banner || ''}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 80vw, 60vw"
                />
              )}
              {/* Legibility scrim only when there's an image behind the text */}
              {(active.cover_image || active.banner) && (
                <span className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              )}
              <span className="relative z-10 flex items-center gap-1 px-4">
                <span
                  className={cn(
                    'text-sm font-bold sm:text-base',
                    active.cover_image || active.banner
                      ? 'text-white'
                      : 'text-accent-dark dark:text-accent',
                  )}
                >
                  Shop all {active.name}
                </span>
                <ChevronRight
                  size={16}
                  className={cn(
                    'transition-transform group-hover:translate-x-0.5',
                    active.cover_image || active.banner
                      ? 'text-white'
                      : 'text-accent-dark dark:text-accent',
                  )}
                />
              </span>
            </Link>

            {/* Subcategory tiles */}
            {active.children.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {active.children.map((sub, i) => (
                  <SubCategoryTile key={sub.id} sub={sub} index={i} />
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Nothing to browse here yet — tap “Shop all {active.name}” above.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

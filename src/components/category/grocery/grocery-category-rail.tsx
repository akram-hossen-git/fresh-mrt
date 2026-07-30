import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Grocery Category Rail                                              */
/*                                                                     */
/*  The left-hand navigation on /categories/[slug] for the grocery     */
/*  preset. Replaces the generic filter sidebar with the same          */
/*  image + title language as the left rail of                         */
/*  <GroceryCategoryBrowser> on /categories.                           */
/*                                                                     */
/*  Depth-aware by construction: the caller passes the CURRENT         */
/*  category's children, so a top-level category shows its             */
/*  subcategories and a subcategory shows its sub-sub-categories.      */
/*  When there are no children the caller hides the rail entirely and  */
/*  lets the product grid run full width.                              */
/*                                                                     */
/*  Layout is a VERTICAL rail at every breakpoint, deliberately         */
/*  matching /categories rather than degrading to a horizontal strip   */
/*  on mobile (explicit request, 2026-07-29). Widths, item stacking     */
/*  and type scale are copied from GroceryCategoryBrowser's left nav    */
/*  so the two surfaces stay visually identical:                       */
/*    - 92px  (mobile)  icon stacked over centered label               */
/*    - 120px (sm)      same                                           */
/*    - 200px (lg)      icon beside left-aligned label                 */
/*                                                                     */
/*  Server component — pure links, no state.                           */
/* ------------------------------------------------------------------ */

export interface CategoryRailItem {
  id: number;
  slug: string;
  name: string;
  icon?: string | null;
  cover_image?: string | null;
}

interface GroceryCategoryRailProps {
  items: CategoryRailItem[];
  /**
   * Current category name. Used for the nav's accessible label only — it is
   * not rendered, because the page already shows it as an <h1> and a 92px
   * column has no room for a second heading.
   */
  title?: string;
  /** Highlights a row when the rail is showing siblings rather than children. */
  activeSlug?: string;
}

export function GroceryCategoryRail({
  items,
  title,
  activeSlug,
}: GroceryCategoryRailProps) {
  if (items.length === 0) return null;

  return (
    <aside className="w-[92px] shrink-0 sm:w-[120px] lg:w-[200px]">
      <nav
        className={cn(
          'sticky top-4 overflow-y-auto overscroll-contain',
          'max-h-[calc(100vh-2rem)]',
          'rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50/60',
          'dark:border-neutral-800 dark:bg-neutral-900/40',
        )}
        aria-label={title ? `${title} subcategories` : 'Subcategories'}
      >
        {items.map((item) => {
          const image = item.icon || item.cover_image || null;
          const isActive = activeSlug === item.slug;

          return (
            <Link
              key={item.id}
              href={`/categories/${item.slug}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex w-full flex-col items-center gap-1 px-1.5 py-3',
                'lg:flex-row lg:gap-2.5 lg:px-3',
                'border-l-[3px] transition-colors',
                isActive
                  ? 'border-accent bg-accent-light dark:bg-accent/10'
                  : 'border-transparent hover:bg-white dark:hover:bg-neutral-900',
              )}
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white dark:bg-neutral-800">
                {image ? (
                  <Image
                    src={image}
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
                  'line-clamp-2 text-center text-[10px] font-medium leading-tight',
                  'lg:text-left lg:text-xs',
                  isActive
                    ? 'text-accent-dark dark:text-accent'
                    : 'text-neutral-600 dark:text-neutral-400',
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

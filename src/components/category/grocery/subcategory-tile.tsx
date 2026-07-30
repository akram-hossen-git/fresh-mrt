import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Subcategory Tile (grocery)                                         */
/*                                                                     */
/*  Square image + name-underneath tile used by every grocery browse   */
/*  surface, so they stay visually identical:                          */
/*    - /categories             (GroceryCategoryIndex)                 */
/*    - homepage "Shop by Aisle" (CategoryShowcase)                    */
/*                                                                     */
/*  Extracted 2026-07-29 when the two-pane GroceryCategoryBrowser was  */
/*  retired — it had the original copy of this markup and the tint      */
/*  helper, and two more copies had grown alongside it.                */
/*                                                                     */
/*  Image source is `icon || cover_image`. Groceries are packshots, so  */
/*  object-contain (not cover) — cover crops the top off a milk carton. */
/* ------------------------------------------------------------------ */

export interface TileCategory {
  id: number;
  slug: string;
  name: string;
  icon?: string | null;
  cover_image?: string | null;
}

/** Deterministic accent tint so image-less tiles still look intentional. */
export function fallbackTint(seed: number): string {
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

interface SubcategoryTileProps {
  category: TileCategory;
  /** Drives the fallback tint so adjacent image-less tiles differ. */
  index?: number;
  /** Passed through to next/image for correct srcset selection. */
  sizes?: string;
}

export function SubcategoryTile({
  category,
  index = 0,
  sizes = '(max-width: 640px) 33vw, 15vw',
}: SubcategoryTileProps) {
  const image = category.icon || category.cover_image || null;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col items-center gap-1.5 text-center"
    >
      <div
        className={cn(
          'relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br',
          image ? 'bg-neutral-50 dark:bg-neutral-900' : fallbackTint(index),
        )}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            sizes={sizes}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center px-1 text-[11px] font-bold uppercase tracking-wide text-accent-dark">
            {category.name.slice(0, 2)}
          </span>
        )}
      </div>
      <span className="line-clamp-2 text-[11px] font-medium leading-tight text-neutral-700 transition-colors group-hover:text-accent dark:text-neutral-300">
        {category.name}
      </span>
    </Link>
  );
}

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SubcategoryTile } from '@/components/category/grocery/subcategory-tile';
import type { MenuCategory } from '@/lib/types/category';

/* ------------------------------------------------------------------ */
/*  Category Showcase (grocery homepage)                               */
/*                                                                     */
/*  "Shop by Aisle" — for each top-level department, renders the        */
/*  department name as a sub-heading followed by a horizontal scroll    */
/*  strip of its SECOND-level subcategories (image + name).            */
/*                                                                     */
/*  Decisions (2026-07-29):                                            */
/*    - Capped at MAX_DEPARTMENTS so the homepage stays scannable;      */
/*      the rest are reachable via the "All" link to /categories.       */
/*    - Horizontal strip here (not the wrapping grid used by            */
/*      /categories) so section height stays fixed on the homepage no   */
/*      matter how many subcategories a department has.                */
/*    - Departments with no children are skipped — a bare title with    */
/*      an empty strip looks broken.                                   */
/*                                                                     */
/*  Tiles come from the shared <SubcategoryTile> so this section and    */
/*  the /categories index stay visually identical; the fixed-width      */
/*  wrapper below is what turns a grid tile into a strip item.         */
/*                                                                     */
/*  Server component — pure presentation, CSS-only scrolling.          */
/* ------------------------------------------------------------------ */

/** How many departments to surface on the homepage. */
const MAX_DEPARTMENTS = 5;

interface CategoryShowcaseProps {
  categories: MenuCategory[];
  /** Override the department cap (e.g. for a denser desktop-only variant). */
  limit?: number;
}

export function CategoryShowcase({
  categories,
  limit = MAX_DEPARTMENTS,
}: CategoryShowcaseProps) {
  // Only departments that actually have second-level children are worth a row.
  const departments = categories
    .filter((cat) => cat.children.length > 0)
    .slice(0, limit);

  if (departments.length === 0) return null;

  return (
    <section className="container mx-auto mt-6 md:mt-8">
      {/* Section heading — matches the modest grocery scale used by
          <SameDayDeals> rather than the large fashion <SectionHeader>. */}
      <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
        <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl dark:text-white">
          Shop by Aisle
        </h2>
        <Link
          href="/categories"
          className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-600 transition-colors hover:text-accent dark:text-neutral-300"
        >
          All
          <ChevronRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="space-y-5 md:space-y-6">
        {departments.map((dept) => (
          <div key={dept.id}>
            {/* Department title — links through to the full department */}
            <Link
              href={`/categories/${dept.slug}`}
              className="group mb-2.5 inline-flex items-center gap-1"
            >
              <h3 className="text-base font-semibold text-neutral-900 transition-colors group-hover:text-accent md:text-lg dark:text-white">
                {dept.name}
              </h3>
              <ChevronRight
                size={16}
                className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>

            {/* Subcategory strip — bleeds to the screen edge on mobile so the
                last tile doesn't look clipped mid-container. */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:gap-4 md:mx-0 md:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {dept.children.map((sub, i) => (
                <div
                  key={sub.id}
                  className="w-[76px] shrink-0 snap-start sm:w-[92px]"
                >
                  <SubcategoryTile category={sub} index={i} sizes="92px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

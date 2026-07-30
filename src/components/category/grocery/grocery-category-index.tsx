import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SubcategoryTile } from '@/components/category/grocery/subcategory-tile';
import type { MenuCategory } from '@/lib/types/category';

/* ------------------------------------------------------------------ */
/*  Grocery Category Index — /categories                               */
/*                                                                     */
/*  Wireframe (locked 2026-07-29): ONE long scrolling page listing      */
/*  every department. Each department is a block —                      */
/*                                                                     */
/*    Fresh Vegetables                                                 */
/*    ───────────────────────────────────────                          */
/*    [🥦]  [🥕]  [🌶️]                                                 */
/*    [🧅]  [🥔]  [🧄]                                                  */
/*    ═══════════════════════════════════════                          */
/*                                                                     */
/*  — name + thin rule, then ALL its subcategories as wrapping image    */
/*  tiles (3 across on mobile), with a heavy divider between            */
/*  departments. Tapping a tile goes to /categories/[slug].            */
/*                                                                     */
/*  This REPLACED the two-pane GroceryCategoryBrowser: the user moved   */
/*  the two-pane treatment to the listing page instead, where the left  */
/*  rail sits beside products rather than beside more categories.       */
/*                                                                     */
/*  Server component — pure links, no state, no client JS.             */
/* ------------------------------------------------------------------ */

interface GroceryCategoryIndexProps {
  categories: MenuCategory[];
}

export function GroceryCategoryIndex({ categories }: GroceryCategoryIndexProps) {
  // A department with no subcategories would render a heading over an empty
  // grid, so it links out as a bare row instead of being dropped entirely.
  const withChildren = categories.filter((c) => c.children.length > 0);

  if (categories.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
        No categories available at the moment.
      </div>
    );
  }

  return (
    <div className="pb-12">
      {withChildren.map((dept, deptIndex) => (
        <section
          key={dept.id}
          className={
            deptIndex > 0
              ? 'mt-7 border-t-2 border-neutral-200 pt-7 dark:border-neutral-800'
              : ''
          }
          aria-labelledby={`dept-${dept.id}`}
        >
          {/* Department heading + thin rule */}
          <div className="mb-4 border-b border-neutral-200 pb-2.5 dark:border-neutral-800">
            <Link
              href={`/categories/${dept.slug}`}
              className="group inline-flex items-center gap-1"
            >
              <h2
                id={`dept-${dept.id}`}
                className="text-base font-semibold text-neutral-900 transition-colors group-hover:text-accent md:text-lg dark:text-white"
              >
                {dept.name}
              </h2>
              <ChevronRight
                size={16}
                className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>
          </div>

          {/* Wrapping tile grid — 3 across on mobile, denser on wider screens */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {dept.children.map((sub, i) => (
              <SubcategoryTile
                key={sub.id}
                category={sub}
                index={i}
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

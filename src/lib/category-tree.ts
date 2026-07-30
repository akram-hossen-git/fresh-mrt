import type { MenuCategory, MenuSubCategory } from '@/lib/types/category';

/* ------------------------------------------------------------------ */
/*  Category tree lookup                                              */
/*                                                                     */
/*  The /categories/menu endpoint returns the whole 3-level tree, so    */
/*  we can answer "what should the listing page's left rail show?"      */
/*  from one cached fetch instead of walking parent_id up the API.      */
/*                                                                     */
/*  Rule (locked 2026-07-29): the rail always shows the SUBCATEGORIES  */
/*  OF THE ENCLOSING DEPARTMENT, so a shopper on Dairy > Milk can hop   */
/*  straight to Cheese without going back.                             */
/* ------------------------------------------------------------------ */

export interface DepartmentContext {
  /** The top-level department containing the requested slug, if found. */
  department: MenuCategory | null;
  /** That department's second-level children — the rail's contents. */
  items: MenuSubCategory[];
  /**
   * Which rail row to highlight. Undefined when viewing the department
   * itself (nothing to highlight — you're "above" every row).
   */
  activeSlug?: string;
}

const EMPTY: DepartmentContext = { department: null, items: [] };

/**
 * Locate `slug` anywhere in the 3-level tree and return the rail context.
 *
 * Depth behaviour:
 *   - Department (level 1)  -> its own children, nothing highlighted.
 *   - Subcategory (level 2) -> its siblings, itself highlighted.
 *   - Sub-sub (level 3)     -> the department's children, with the level-2
 *                              PARENT highlighted (level 3 has no rail row
 *                              of its own; the locked spec treats level 3
 *                              as filter chips on the listing, not nav).
 *   - Not found             -> empty, so the caller hides the rail.
 */
export function findDepartmentContext(
  tree: MenuCategory[],
  slug: string,
): DepartmentContext {
  if (!slug || tree.length === 0) return EMPTY;

  for (const department of tree) {
    // Level 1 — viewing the department itself.
    if (department.slug === slug) {
      return { department, items: department.children };
    }

    for (const sub of department.children) {
      // Level 2 — viewing a subcategory: show its siblings.
      if (sub.slug === slug) {
        return { department, items: department.children, activeSlug: sub.slug };
      }

      // Level 3 — highlight the level-2 ancestor, which IS a rail row.
      if (sub.children?.some((subSub) => subSub.slug === slug)) {
        return { department, items: department.children, activeSlug: sub.slug };
      }
    }
  }

  return EMPTY;
}

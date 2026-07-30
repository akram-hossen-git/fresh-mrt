/* ------------------------------------------------------------------ */
/*  Homepage data shape                                                */
/*                                                                     */
/*  Assembled by the homepage server component (src/app/page.tsx) from */
/*  ten parallel API calls and handed to <GroceryHomepageSections>.    */
/*                                                                     */
/*  Fields stay loosely typed on purpose: each list comes from a        */
/*  different Laravel endpoint whose payloads overlap but don't match   */
/*  exactly (FlashDealProduct vs ProductMini, slider vs banner), and    */
/*  every consumer narrows it at the point of use.                     */
/*                                                                     */
/*  NOTE: the live definition consumed by both homepage renderers is    */
/*  the one exported from components/home/homepage-sections.tsx. Keep   */
/*  this mirror in sync if you change either.                          */
/* ------------------------------------------------------------------ */

import type { MenuCategory } from './category';

export interface HomepageData {
  sliders: any[];
  categories: any[];
  /** Full /categories/menu tree — drives the grocery "Shop by Aisle" section. */
  menuCategories: MenuCategory[];
  featuredProducts: any[];
  bestSellers: any[];
  todaysDeals: any[];
  flashDeals: any[];
  bannersOne: any[];
  bannersTwo: any[];
  bannersThree: any[];
}

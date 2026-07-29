/* ------------------------------------------------------------------ */
/*  Homepage data shape                                                */
/*                                                                     */
/*  Assembled by the homepage server component (src/app/page.tsx) from */
/*  nine parallel API calls and handed to <GroceryHomepageSections>.   */
/*                                                                     */
/*  Fields stay loosely typed on purpose: each list comes from a        */
/*  different Laravel endpoint whose payloads overlap but don't match   */
/*  exactly (FlashDealProduct vs ProductMini, slider vs banner), and    */
/*  every consumer narrows it at the point of use.                     */
/* ------------------------------------------------------------------ */

export interface HomepageData {
  sliders: any[];
  categories: any[];
  featuredProducts: any[];
  bestSellers: any[];
  todaysDeals: any[];
  flashDeals: any[];
  bannersOne: any[];
  bannersTwo: any[];
  bannersThree: any[];
}

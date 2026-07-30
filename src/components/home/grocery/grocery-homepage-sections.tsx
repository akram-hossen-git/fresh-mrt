import { storeConfig } from '@/config/store.config';
import { HeroSlider } from '@/components/home/hero-slider';
import { CategoryBar } from '@/components/category/category-bar';
import { SectionHeader } from '@/components/home/section-header';
import { ProductGrid } from '@/components/product/product-grid';
import { SameDayDeals } from '@/components/home/grocery/same-day-deals';
import { CategoryShowcase } from '@/components/home/grocery/category-showcase';
import HomeCategoriesSection from '@/components/home/home-categories-section';
import type { HomepageData } from '@/components/home/homepage-sections';

/* ------------------------------------------------------------------ */
/*  Grocery Homepage Sections                                          */
/*                                                                     */
/*  Parallel to the fashion/standard <HomepageSections> renderer, but  */
/*  composed in the LOCKED grocery wireframe order (mobile-first):     */
/*                                                                     */
/*    1. hero-slider                                                   */
/*    2. category-bar                                                  */
/*    3. Shop by Aisle    (top-level depts + their subcategories)      */
/*    4. Same-Day Deals   (flash-deals + todays-deals merged)          */
/*    5. Buy Again        (best-sellers relabeled; guest fallback)     */
/*    6. Recommended      (featured-products relabeled)                */
/*                                                                     */
/*  trust-bar + newsletter are intentionally dropped from the top.     */
/*  The fashion path (<HomepageSections>) is untouched — this file is  */
/*  only reached when storeConfig.headerStyle === 'grocery'.           */
/* ------------------------------------------------------------------ */

const cols = storeConfig.sections.homepageGridColumns;

export function GroceryHomepageSections({ data }: { data: HomepageData }) {
  return (
    <>
      {/* 1. Hero slider */}
      {data.sliders.length > 0 && <HeroSlider sliders={data.sliders} />}

      {/* 2. Category bar */}
      {data.categories.length > 0 && (
        <section className="container mx-auto mt-6 md:mt-8">
          <CategoryBar categories={data.categories} />
        </section>
      )}

      {/* Home categories: name + lazy carousel */}
      <section className="container mx-auto mt-6 md:mt-8">
        <HomeCategoriesSection />
      </section>

      {/* 3. Shop by Aisle — each top-level dept + its subcategories.
          Self-guards when the menu tree is empty. */}
      <CategoryShowcase categories={data.menuCategories} />

      {/* 4. Same-Day Deals — flash-deals + todays-deals merged */}
      <SameDayDeals
        todaysDeals={data.todaysDeals}
        flashDeals={data.flashDeals}
        columns={cols}
      />

      {/* 5. Buy Again — best-sellers relabeled (guest fallback).
          TODO: when logged in, swap to real /purchase-history in a
          client component. Guest/default = best-sellers. */}
      {data.bestSellers.length > 0 && (
        <section className="container mx-auto mt-8 md:mt-10">
          <SectionHeader
            title="Buy Again"
            subtitle="Your everyday essentials, one tap away"
            viewAllLink="/best-sellers"
          />
          <ProductGrid products={data.bestSellers} columns={cols} />
        </section>
      )}

      {/* 6. Recommended — featured-products relabeled */}
      {data.featuredProducts.length > 0 && (
        <section className="container mx-auto mt-8 md:mt-10">
          <SectionHeader
            title="Recommended"
            subtitle="Picked for you"
            viewAllLink="/new-arrivals"
          />
          <ProductGrid products={data.featuredProducts} columns={cols} />
        </section>
      )}
    </>
  );
}

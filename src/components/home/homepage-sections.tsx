import type { HomepageSection } from '@/config/store.types';
import type { MenuCategory } from '@/lib/types/category';
import { storeConfig } from '@/config/store.config';
import { HeroSlider } from '@/components/home/hero-slider';
import { TrustBar } from '@/components/home/trust-bar';
import { CategoryBar } from '@/components/category/category-bar';
import { SectionHeader } from '@/components/home/section-header';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductCarousel } from '@/components/product/product-carousel';
import { BannerGrid } from '@/components/home/banner-grid';
import { FlashDealBanner } from '@/components/home/flash-deal-banner';
import { CustomerReviews } from '@/components/home/customer-reviews';
import { Newsletter } from '@/components/home/newsletter';

/* ------------------------------------------------------------------ */
/*  Data shape passed from the homepage server component                */
/* ------------------------------------------------------------------ */

export interface HomepageData {
  sliders: any[];
  categories: any[];
  /** Full /categories/menu tree. Consumed by the grocery "Shop by Aisle"
   *  section; unused by the fashion/standard renderer below. */
  menuCategories: MenuCategory[];
  featuredProducts: any[];
  bestSellers: any[];
  todaysDeals: any[];
  flashDeals: any[];
  bannersOne: any[];
  bannersTwo: any[];
  bannersThree: any[];
}

/* ------------------------------------------------------------------ */
/*  Section renderers                                                  */
/*  Each returns JSX or null if data is missing.                       */
/* ------------------------------------------------------------------ */

const cols = storeConfig.sections.homepageGridColumns;
const threshold = storeConfig.sections.useCarouselThreshold;

function renderSection(section: HomepageSection, data: HomepageData) {
  switch (section) {
    case 'hero-slider':
      return data.sliders.length > 0 ? <HeroSlider sliders={data.sliders} /> : null;

    case 'trust-bar':
      return <TrustBar />;

    case 'category-bar':
      return data.categories.length > 0 ? (
        <section className="container mx-auto mt-8 md:mt-10">
          <CategoryBar categories={data.categories} />
        </section>
      ) : null;

    case 'featured-products':
      return data.featuredProducts.length > 0 ? (
        <section className="container mx-auto">
          <SectionHeader title="New Arrivals" subtitle="Fresh drops added this week" viewAllLink="/new-arrivals" />
          <ProductGrid products={data.featuredProducts} columns={cols} />
        </section>
      ) : null;

    case 'banner-grid':
      return (
        <section className="mt-10 md:mt-14">
          <BannerGrid bannersOne={data.bannersOne} bannersTwo={data.bannersTwo} bannersThree={data.bannersThree} />
        </section>
      );

    case 'flash-deals':
      return data.flashDeals.length > 0 ? (
        <section className="mt-10 md:mt-14">
          <FlashDealBanner flashDeals={data.flashDeals} />
        </section>
      ) : null;

    case 'best-sellers':
      return data.bestSellers.length > 0 ? (
        <section className="container mx-auto mt-10 md:mt-14">
          <SectionHeader title="Best Sellers" subtitle="What everyone's buying right now" viewAllLink="/best-sellers" />
          {data.bestSellers.length > threshold
            ? <ProductCarousel products={data.bestSellers} />
            : <ProductGrid products={data.bestSellers} columns={cols} />}
        </section>
      ) : null;

    case 'todays-deals':
      return data.todaysDeals.length > 0 ? (
        <section className="bg-neutral-50 dark:bg-neutral-900 mt-10 md:mt-14 py-2">
          <div className="container mx-auto">
            <SectionHeader title="Today's Deals" subtitle="Limited-time prices. Move fast." viewAllLink="/todays-deals" />
            {data.todaysDeals.length > threshold
              ? <ProductCarousel products={data.todaysDeals} />
              : <ProductGrid products={data.todaysDeals} columns={cols} />}
          </div>
        </section>
      ) : null;

    case 'customer-reviews':
      return <CustomerReviews />;

    case 'newsletter':
      return <Newsletter />;

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Main renderer — renders sections in config order                   */
/* ------------------------------------------------------------------ */

export function HomepageSections({ data }: { data: HomepageData }) {
  return (
    <>
      {storeConfig.homepageSections.map((section) => {
        const rendered = renderSection(section, data);
        return rendered ? <div key={section}>{rendered}</div> : null;
      })}
    </>
  );
}

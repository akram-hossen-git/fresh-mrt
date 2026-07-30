import type { Metadata } from 'next';
import { storeConfig } from '@/config/store.config';
import { getSliders, getBannersOne, getBannersTwo, getBannersThree, getFlashDeals } from '@/lib/api/home';
import { getFeaturedCategories, getCategoryMenu } from '@/lib/api/categories';
import { getFeaturedProducts, getBestSellers, getTodaysDeals } from '@/lib/api/products';
import { HomepageSections } from '@/components/home/homepage-sections';
import { GroceryHomepageSections } from '@/components/home/grocery/grocery-homepage-sections';

const { content } = storeConfig;

export const metadata: Metadata = {
  title: `${content.name} | ${content.tagline}`,
};

export default async function HomePage() {
  const [
    slidersResult,
    categoriesResult,
    menuCategoriesResult,
    featuredResult,
    bestSellersResult,
    todaysDealsResult,
    flashDealsResult,
    bannersOneResult,
    bannersTwoResult,
    bannersThreeResult,
  ] = await Promise.allSettled([
    getSliders(),
    getFeaturedCategories(),
    getCategoryMenu(),
    getFeaturedProducts(),
    getBestSellers(),
    getTodaysDeals(),
    getFlashDeals(),
    getBannersOne(),
    getBannersTwo(),
    getBannersThree(),
  ]);

  const data = {
    sliders: slidersResult.status === 'fulfilled' ? slidersResult.value.data ?? [] : [],
    categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value.data ?? [] : [],
    // Full 3-level tree — the grocery "Shop by Aisle" section reads the
    // top level + its children from this. Fetched server-side (rather than
    // via CategoryMenuProvider) so it gets ISR caching and no loading flash.
    menuCategories: menuCategoriesResult.status === 'fulfilled' ? menuCategoriesResult.value.data ?? [] : [],
    featuredProducts: featuredResult.status === 'fulfilled' ? featuredResult.value.data ?? [] : [],
    bestSellers: bestSellersResult.status === 'fulfilled' ? bestSellersResult.value.data ?? [] : [],
    todaysDeals: todaysDealsResult.status === 'fulfilled' ? todaysDealsResult.value.data ?? [] : [],
    flashDeals: flashDealsResult.status === 'fulfilled' ? flashDealsResult.value.data ?? [] : [],
    bannersOne: bannersOneResult.status === 'fulfilled' ? bannersOneResult.value.data ?? [] : [],
    bannersTwo: bannersTwoResult.status === 'fulfilled' ? bannersTwoResult.value.data ?? [] : [],
    bannersThree: bannersThreeResult.status === 'fulfilled' ? bannersThreeResult.value.data ?? [] : [],
  };

  // Grocery preset uses its own wireframe-locked section order.
  // Fashion/baby keep the standard config-driven renderer untouched.
  if (storeConfig.headerStyle === 'grocery') {
    return <GroceryHomepageSections data={data} />;
  }

  return <HomepageSections data={data} />;
}

import type { StoreConfig } from '../store.types';

export const fashionPreset: StoreConfig = {
  id: 'fashion',
  niche: 'Fashion & Apparel',

  theme: {
    colors: {
      accent: '#FF3D00',
      accentLight: '#FFF0EB',
      accentDark: '#CC3100',
      selection: '#FF3D00',
    },
    fonts: {
      heading: 'barlow',
      body: 'inter',
      headingUppercase: true,
      headingTracking: 'tight',
    },
    radius: {
      card: '10px',
      button: '8px',
      badge: '9999px',
    },
  },

  productCard: 'tall',

  homepageSections: [
    'hero-slider',
    'trust-bar',
    'category-bar',
    'featured-products',
    'banner-grid',
    'flash-deals',
    'best-sellers',
    'todays-deals',
    'customer-reviews',
    'newsletter',
  ],

  headerStyle: 'standard',
  mobileNav: 'hamburger',

  content: {
    name: 'LUXE',
    tagline: 'Premium Fashion Store',
    announcement: 'Free shipping on orders over ৳999',
    metaDescription:
      'Discover premium fashion collections curated for the modern connoisseur. Shop new arrivals, best sellers, and exclusive deals.',
  },

  sections: {
    homepageGridColumns: 4,
    useCarouselThreshold: 4,
    sectionHeaderStyle: 'accent-bar',
  },
};

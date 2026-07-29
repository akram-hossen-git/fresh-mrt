import type { StoreConfig } from '../store.types';

export const groceryPreset: StoreConfig = {
  id: 'grocery',
  niche: 'Grocery & Fresh Food',

  theme: {
    colors: {
      accent: '#16A34A',
      accentLight: '#F0FDF4',
      accentDark: '#15803D',
      selection: '#16A34A',
    },
    fonts: {
      heading: 'poppins',
      body: 'inter',
      headingUppercase: false,
      headingTracking: 'normal',
    },
    radius: {
      card: '12px',
      button: '10px',
      badge: '9999px',
    },
  },

  productCard: 'grocery',

  homepageSections: [
    'hero-slider',
    'category-bar',
    'trust-bar',
    'flash-deals',
    'featured-products',
    'best-sellers',
    'banner-grid',
    'todays-deals',
    'newsletter',
  ],

  headerStyle: 'grocery',
  mobileNav: 'bottom-tabs',

  content: {
    name: 'FreshMart',
    tagline: 'Fresh Groceries Delivered',
    announcement: 'Order before 2pm for same-day delivery',
    metaDescription:
      'Shop fresh groceries, fruits, vegetables, and daily essentials online. Fast delivery to your doorstep.',
  },

  sections: {
    homepageGridColumns: 5,
    useCarouselThreshold: 5,
    sectionHeaderStyle: 'plain',
  },
};

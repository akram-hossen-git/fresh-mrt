import type { StoreConfig } from '../store.types';

export const babyPreset: StoreConfig = {
  id: 'baby',
  niche: 'Baby & Kids',

  theme: {
    colors: {
      accent: '#8B5CF6',
      accentLight: '#F5F3FF',
      accentDark: '#7C3AED',
      selection: '#8B5CF6',
    },
    fonts: {
      heading: 'poppins',
      body: 'poppins',
      headingUppercase: false,
      headingTracking: 'normal',
    },
    radius: {
      card: '16px',
      button: '12px',
      badge: '9999px',
    },
  },

  productCard: 'square',

  homepageSections: [
    'hero-slider',
    'trust-bar',
    'category-bar',
    'featured-products',
    'best-sellers',
    'banner-grid',
    'flash-deals',
    'todays-deals',
    'customer-reviews',
    'newsletter',
  ],

  headerStyle: 'minimal',
  mobileNav: 'hamburger',

  content: {
    name: 'TinyJoy',
    tagline: 'Everything for Your Little One',
    announcement: 'Free delivery on baby essentials over ৳499',
    metaDescription:
      'Shop baby diapers, clothing, feeding supplies, and toys. Trusted brands, fast delivery, and easy returns.',
  },

  sections: {
    homepageGridColumns: 4,
    useCarouselThreshold: 4,
    sectionHeaderStyle: 'underline',
  },
};

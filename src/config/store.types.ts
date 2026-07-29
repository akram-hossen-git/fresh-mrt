/* ------------------------------------------------------------------ */
/*  Store Configuration Types                                         */
/*  Every niche (fashion, grocery, baby, etc.) gets its own preset    */
/*  that implements this interface.                                    */
/* ------------------------------------------------------------------ */

/** Color palette — all values are hex strings */
export interface ThemeColors {
  /** Primary accent used for CTAs, links, active states */
  accent: string;
  /** Lighter shade of accent for backgrounds, badges */
  accentLight: string;
  /** Darker shade for hover states */
  accentDark: string;
  /** Selection/highlight background */
  selection: string;
}

/** Font configuration */
export interface ThemeFonts {
  /** Display/heading font — used for section titles, product names on detail page */
  heading: 'barlow' | 'inter' | 'poppins';
  /** Body/UI font — used for everything else */
  body: 'inter' | 'poppins';
  /** Whether headings should be uppercase */
  headingUppercase: boolean;
  /** Letter spacing for headings: 'tight' | 'normal' | 'wide' */
  headingTracking: 'tight' | 'normal' | 'wide';
}

/** Border radius tokens */
export interface ThemeRadius {
  /** Cards, product images */
  card: string;
  /** Buttons, inputs */
  button: string;
  /** Badges, chips */
  badge: string;
}

/** Full theme definition */
export interface StoreTheme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: ThemeRadius;
}

/* ------------------------------------------------------------------ */
/*  Product Card Variants                                              */
/* ------------------------------------------------------------------ */

export type ProductCardVariant = 'tall' | 'square' | 'compact' | 'grocery';

/* ------------------------------------------------------------------ */
/*  Homepage Section Registry                                          */
/* ------------------------------------------------------------------ */

export type HomepageSection =
  | 'hero-slider'
  | 'trust-bar'
  | 'category-bar'
  | 'featured-products'
  | 'banner-grid'
  | 'flash-deals'
  | 'best-sellers'
  | 'todays-deals'
  | 'customer-reviews'
  | 'newsletter';

/* ------------------------------------------------------------------ */
/*  Header Style                                                       */
/* ------------------------------------------------------------------ */

export type HeaderStyle = 'minimal' | 'standard' | 'grocery';

/* ------------------------------------------------------------------ */
/*  Mobile Navigation Style                                            */
/* ------------------------------------------------------------------ */

export type MobileNav = 'hamburger' | 'bottom-tabs';

/* ------------------------------------------------------------------ */
/*  Store Content (text that varies per store)                          */
/* ------------------------------------------------------------------ */

export interface StoreContent {
  /** Store name displayed in header/footer */
  name: string;
  /** Tagline used in metadata */
  tagline: string;
  /** Announcement bar text (set empty to hide) */
  announcement: string;
  /** Meta description */
  metaDescription: string;
}

/* ------------------------------------------------------------------ */
/*  Section-specific settings                                          */
/* ------------------------------------------------------------------ */

export interface SectionSettings {
  /** How many columns for product grids on homepage (3 | 4 | 5) */
  homepageGridColumns: 2 | 3 | 4 | 5;
  /** Whether to use carousel for sections with many products */
  useCarouselThreshold: number;
  /** Section header style */
  sectionHeaderStyle: 'accent-bar' | 'underline' | 'plain';
}

/* ------------------------------------------------------------------ */
/*  Complete Store Config                                              */
/* ------------------------------------------------------------------ */

export interface StoreConfig {
  /** Unique identifier for this store config */
  id: string;
  /** Human-readable niche label */
  niche: string;
  /** Visual theme */
  theme: StoreTheme;
  /** Which product card variant to use */
  productCard: ProductCardVariant;
  /** Homepage sections in display order */
  homepageSections: HomepageSection[];
  /** Header style */
  headerStyle: HeaderStyle;
  /** Mobile navigation style */
  mobileNav: MobileNav;
  /** Store content / copy */
  content: StoreContent;
  /** Section-level settings */
  sections: SectionSettings;
}

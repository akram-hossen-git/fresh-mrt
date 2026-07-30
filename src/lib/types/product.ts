export interface ProductMini {
  id: number;
  slug: string;
  name: string;
  thumbnail_image: string;
  back_image: string;
  has_discount: boolean;
  discount: string;
  stroked_price: string;
  main_price: string;
  rating: number;
  sales: number;
  is_wholesale: boolean;
  /** Pack size / unit label, e.g. "1 kg", "500 ml". Grocery card shows this. */
  unit?: string;
  /** Available stock. Grocery card shows an out-of-stock state at 0. */
  current_stock?: number;
  /** True when a variant must be chosen before adding to cart. */
  has_variants?: boolean;
  /** Minimum order quantity. */
  min_qty?: number;
  links: { details: string };
}

export interface ProductDetail {
  id: number;
  name: string;
  added_by: string;
  seller_id: number;
  shop_id: number;
  shop_slug: string;
  shop_name: string;
  shop_logo: string;
  photos: { variant: string; color: string; path: string }[];
  thumbnail_image: string;
  tags: string[];
  price_high_low: string;
  choice_options: ChoiceOption[];
  colors: { name: string; code: string }[];
  has_discount: boolean;
  discount: string;
  stroked_price: string;
  main_price: string;
  calculable_price: number;
  currency_symbol: string;
  current_stock: number;
  unit: string;
  rating: number;
  rating_count: number;
  earn_point: number;
  description: string;
  downloads: string | null;
  video_link: string;
  brand: { id: number; slug: string; name: string; logo: string };
  /** Primary category + its parent, for a category breadcrumb (e.g. "Dairy > Milk"). */
  category?: {
    id: number;
    slug: string;
    name: string;
    parent: { id: number; slug: string; name: string } | null;
  } | null;
  /** Unformatted pre-discount price, for computing savings ("Save ৳X"). */
  base_price_numeric?: number;
  link: string;
  wholesale: WholesalePrice[];
  est_shipping_time: number;
}

export interface ChoiceOption {
  name: number;
  title: string;
  options: string[];
}

export interface WholesalePrice {
  min_qty: number;
  max_qty: number;
  price: number;
}

export interface VariantPriceResponse {
  result: boolean;
  data: {
    price: string;
    stock: number;
    stock_txt: string;
    digital: number;
    variant: string;
    variation: string;
    max_limit: number;
    in_stock: number;
    image: string;
  };
}

export interface SearchProduct {
  name: string;
  thumbnail_image: string;
  base_price: number;
  base_discounted_price: number;
  rating: number;
  links: {
    details: string;
    reviews: string;
    related: string;
    top_from_seller: string;
  };
}

export interface FlashDealProduct {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: string;
  links: { details: string };
}

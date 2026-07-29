import type { FlashDealProduct } from './product';

export interface Slider {
  photo: string;
  url: string;
}

export interface Banner {
  photo: string;
  url: string;
  position: number;
}

export interface FlashDeal {
  id: number;
  slug: string;
  title: string;
  date: number;
  banner: string;
  products: { data: FlashDealProduct[] };
}

export interface ShopMini {
  id: number;
  slug: string;
  name: string;
  logo: string;
  rating: number;
}

export interface ShopDetail {
  id: number;
  user_id: number;
  name: string;
  title: string;
  description: string;
  delivery_pickup_latitude: string;
  delivery_pickup_longitude: string;
  logo: string;
  sliders: string[];
  address: string;
  phone: string;
  facebook: string;
  google: string;
  twitter: string;
  instagram: string;
  youtube: string;
  rating: number;
  verified: boolean;
  email: string;
  products: number;
  orders: number;
  sales: string;
}

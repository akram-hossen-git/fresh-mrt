export interface CartItem {
  id: number;
  seller_id: number;
  /** Underlying product id — needed to map cart lines back to product cards. */
  product_id: number;
  product: {
    name: string;
    image: string;
    unit?: string;
  };
  variation: string;
  price: number;
  tax: number;
  shipping_cost: number;
  quantity: number;
  /** Stock cap for this line, so steppers can stop incrementing. */
  stock?: number;
  date: string;
}

export interface CartSummary {
  sub_total: string;
  tax: string;
  shipping_cost: string;
  discount: string;
  grand_total: string;
  grand_total_value: number;
  coupon_applied: boolean;
  coupon_code: string | null;
}

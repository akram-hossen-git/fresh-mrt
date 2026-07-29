import { apiFetch } from '../api-client';
import type { ActionResponse } from '../types/common';
import type { CartItem } from '../types/cart';

// Backend response shapes (what Laravel actually returns)
interface BackendCartItem {
  id: number;
  owner_id: number;
  product_id: number;
  product_name: string;
  product_thumbnail_image: string;
  unit?: string;
  variation: string;
  price: string;
  tax: string;
  shipping_cost: number;
  quantity: number;
  /** Stock cap for this variant — CartController sends it as upper_limit/stock */
  upper_limit?: number;
  stock?: number;
  lower_limit?: number;
  digital?: number;
}

interface BackendShopGroup {
  name: string;
  owner_id: number;
  sub_total: string;
  cart_items: BackendCartItem[];
}

interface BackendCartResponse {
  grand_total: string;
  data: BackendShopGroup[];
}

interface BackendSummaryResponse {
  sub_total: string;
  tax: string;
  shipping_cost: string;
  discount: string;
  grand_total: string;
  grand_total_value: number;
  coupon_code: string;
  coupon_applied: boolean;
}

export async function addToCart(data: {
  id: number; variant?: string; quantity: number;
  user_id?: number; temp_user_id?: string;
}) {
  return apiFetch<ActionResponse>('/carts/add', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCartItems(userId?: number, tempUserId?: string) {
  const res = await apiFetch<BackendCartResponse>('/carts', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, temp_user_id: tempUserId }),
  });

  // Flatten shop groups into a flat CartItem[] the page expects
  const items: CartItem[] = (res.data ?? []).flatMap((shop) =>
    (shop.cart_items ?? []).map((item) => ({
      id: item.id,
      seller_id: shop.owner_id,
      product_id: item.product_id,
      product: {
        name: item.product_name,
        image: item.product_thumbnail_image,
        unit: item.unit ?? '',
      },
      variation: item.variation ?? '',
      price: parseFloat(item.price.replace(/[^0-9.-]/g, '')) || 0,
      tax: parseFloat(item.tax.replace(/[^0-9.-]/g, '')) || 0,
      shipping_cost: item.shipping_cost,
      quantity: item.quantity,
      stock: item.stock ?? item.upper_limit,
      date: '',
    }))
  );

  return { data: items, success: true };
}

export async function changeQuantity(cartId: number, quantity: number) {
  return apiFetch<ActionResponse>('/carts/change-quantity', {
    method: 'POST',
    body: JSON.stringify({ id: cartId, quantity }),
  });
}

export async function removeFromCart(cartId: number) {
  return apiFetch<ActionResponse>(`/carts/${cartId}`, { method: 'DELETE' });
}

export async function getCartSummary(userId?: number, tempUserId?: string) {
  const res = await apiFetch<BackendSummaryResponse>('/cart-summary', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, temp_user_id: tempUserId }),
  });

  // Wrap in the { data, success } shape the page expects
  return { data: res, success: true };
}

export async function getCartCount(userId?: number, tempUserId?: string) {
  return apiFetch<{ count: number; status: boolean }>('/cart-count', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, temp_user_id: tempUserId }),
  });
}

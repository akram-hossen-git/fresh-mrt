import { apiFetch } from '../api-client';
import type { ActionResponse, ApiResponse } from '../types/common';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    thumbnail_image: string;
    base_price: string;
    rating: number;
  };
}

export async function getWishlist() {
  return apiFetch<ApiResponse<WishlistItem[]>>('/wishlists');
}

export async function addToWishlist(productSlug: string) {
  return apiFetch<ActionResponse>(`/wishlists-add-product/${productSlug}`);
}

export async function removeFromWishlist(productSlug: string) {
  return apiFetch<ActionResponse>(`/wishlists-remove-product/${productSlug}`);
}

export async function checkWishlist(productSlug: string) {
  return apiFetch<{ is_in_wishlist: boolean; product_id: number }>(`/wishlists-check-product/${productSlug}`);
}

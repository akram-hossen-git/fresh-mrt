import { apiFetch } from '../api-client';
import type { ApiResponse, ActionResponse } from '../types/common';
import type { Review } from '../types/review';

export async function getProductReviews(productId: number) {
  return apiFetch<ApiResponse<Review[]>>(`/reviews/product/${productId}`);
}

export async function submitReview(data: { product_id: number; rating: number; comment: string }) {
  return apiFetch<ActionResponse>('/reviews/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

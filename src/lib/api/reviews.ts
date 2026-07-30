import { apiFetch, serverFetch } from '../api-client';
import type { ApiResponse, ActionResponse } from '../types/common';
import type { Review } from '../types/review';

export async function getProductReviews(productId: number) {
  return serverFetch<ApiResponse<Review[]>>(`/reviews/product/${productId}`, { revalidate: 60 });
}

export async function submitReview(data: { product_id: number; rating: number; comment: string }) {
  return apiFetch<ActionResponse>('/reviews/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

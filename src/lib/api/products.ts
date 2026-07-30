import { apiFetch, serverFetch } from '../api-client';
import type { ApiResponse, PaginatedResponse } from '../types/common';
import type { ProductMini, ProductDetail, VariantPriceResponse } from '../types/product';

export async function getProducts(page: number = 1) {
  return serverFetch<PaginatedResponse<ProductMini>>(`/products?page=${page}`);
}

export async function getProductBySlug(slug: string, userId: number = 0) {
  return serverFetch<ApiResponse<ProductDetail[]>>(`/products/${slug}/${userId}`, { revalidate: 300, tags: ['product', slug] });
}

export async function searchProducts(params: {
  name?: string; categories?: string; brands?: string;
  sort_key?: string; min?: number; max?: number; page?: number;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') searchParams.append(key, String(value));
  });
  return serverFetch<PaginatedResponse<ProductMini>>(`/products/search?${searchParams.toString()}`, { revalidate: 30 });
}

export async function getFeaturedProducts() {
  return serverFetch<ApiResponse<ProductMini[]>>('/products/featured', { revalidate: 120, tags: ['featured'] });
}

export async function getBestSellers() {
  return serverFetch<ApiResponse<ProductMini[]>>('/products/best-seller', { revalidate: 120, tags: ['best-sellers'] });
}

export async function getTodaysDeals() {
  return serverFetch<ApiResponse<ProductMini[]>>('/products/todays-deal', { revalidate: 120, tags: ['todays-deal'] });
}

export async function getCategoryProducts(slug: string, page: number = 1, filters?: {
  brands?: string; min?: number; max?: number; sort_key?: string;
}) {
  const params = new URLSearchParams();
  params.append('page', String(page));
  if (filters?.brands) params.append('brands', filters.brands);
  if (filters?.min !== undefined) params.append('min', String(filters.min));
  if (filters?.max !== undefined) params.append('max', String(filters.max));
  if (filters?.sort_key) params.append('sort_key', filters.sort_key);
  return serverFetch<PaginatedResponse<ProductMini>>(`/products/category/${slug}?${params.toString()}`, { revalidate: 30 });
}

export async function getBrandProducts(slug: string, page: number = 1) {
  return serverFetch<PaginatedResponse<ProductMini>>(`/products/brand/${slug}?page=${page}`, { revalidate: 60 });
}

export async function getTopFromSeller(slug: string) {
  return serverFetch<ApiResponse<ProductMini[]>>(`/products/top-from-seller/${slug}`, { revalidate: 120 });
}

export async function getFrequentlyBought(slug: string) {
  return serverFetch<ApiResponse<ProductMini[]>>(`/products/frequently-bought/${slug}`, { revalidate: 120 });
}

export async function getVariantPrice(data: { id: number; color?: string; [key: string]: unknown }) {
  return apiFetch<VariantPriceResponse>('/products/variant/price', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getDigitalProducts(page: number = 1) {
  return serverFetch<PaginatedResponse<ProductMini>>(`/products/digital?page=${page}`);
}

export async function getLastViewed() {
  return apiFetch<ApiResponse<ProductMini[]>>('/products/last-viewed');
}

export async function getSearchSuggestions(query: string) {
  return serverFetch<{ data: string[] }>(`/get-search-suggestions?query=${encodeURIComponent(query)}`, { revalidate: 0 });
}

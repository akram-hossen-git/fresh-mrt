import { serverFetch } from '../api-client';
import type { ApiResponse, PaginatedResponse } from '../types/common';
import type { ShopMini, ShopDetail } from '../types/shop';
import type { ProductMini } from '../types/product';
import type { Brand } from './filters';

export async function getShops(page: number = 1) {
  return serverFetch<PaginatedResponse<ShopMini>>(`/shops?page=${page}`, { revalidate: 120 });
}

export async function getShopDetails(idOrSlug: string | number) {
  return serverFetch<{ data: ShopDetail; success: boolean }>(`/shops/details/${idOrSlug}`, { revalidate: 120 });
}

export async function getShopAllProducts(id: number, page: number = 1) {
  return serverFetch<PaginatedResponse<ProductMini>>(`/shops/products/all/${id}?page=${page}`, { revalidate: 60 });
}

export async function getShopTopProducts(id: number) {
  return serverFetch<ApiResponse<ProductMini[]>>(`/shops/products/top/${id}`, { revalidate: 120 });
}

export async function getShopNewProducts(id: number) {
  return serverFetch<ApiResponse<ProductMini[]>>(`/shops/products/new/${id}`, { revalidate: 120 });
}

export async function getShopFeaturedProducts(id: number) {
  return serverFetch<ApiResponse<ProductMini[]>>(`/shops/products/featured/${id}`, { revalidate: 120 });
}

export async function getShopBrands(id: number) {
  return serverFetch<ApiResponse<Brand[]>>(`/shops/brands/${id}`, { revalidate: 300 });
}

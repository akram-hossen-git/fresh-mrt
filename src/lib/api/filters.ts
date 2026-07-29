import { serverFetch } from '../api-client';
import type { ApiResponse } from '../types/common';

export interface FilterCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
  logo: string;
}

export async function getFilterCategories() {
  return serverFetch<ApiResponse<FilterCategory[]>>('/filter/categories', { revalidate: 300 });
}

export async function getFilterBrands() {
  return serverFetch<ApiResponse<Brand[]>>('/filter/brands', { revalidate: 300 });
}

export async function getAllBrands() {
  return serverFetch<ApiResponse<Brand[]>>('/all-brands', { revalidate: 300 });
}

export async function getTopBrands() {
  return serverFetch<ApiResponse<Brand[]>>('/brands/top', { revalidate: 300 });
}

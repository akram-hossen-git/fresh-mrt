import { serverFetch } from '../api-client';
import type { ApiResponse } from '../types/common';
import type { Category, HomeCategory, SubCategory, MenuCategory } from '../types/category';

export async function getCategories() {
  return serverFetch<ApiResponse<Category[]>>('/categories', { revalidate: 300, tags: ['categories'] });
}

export async function getFeaturedCategories() {
  return serverFetch<ApiResponse<Category[]>>('/categories/featured', { revalidate: 300, tags: ['featured-categories'] });
}

export async function getHomeCategories() {
  return serverFetch<ApiResponse<HomeCategory[]>>('/home-categories', { revalidate: 300 });
}

export async function getTopCategories() {
  return serverFetch<ApiResponse<Category[]>>('/categories/top', { revalidate: 300 });
}

export async function getCategoryInfo(slug: string) {
  return serverFetch<ApiResponse<Category[]>>(`/category/info/${slug}`, { revalidate: 300 });
}

export async function getSubCategories(id: number) {
  return serverFetch<ApiResponse<SubCategory[]>>(`/sub-categories/${id}`, { revalidate: 300 });
}

export async function getCategoryMenu() {
  return serverFetch<{ success: boolean; data: MenuCategory[] }>('/categories/menu', { revalidate: 300, tags: ['category-menu'] });
}

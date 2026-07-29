import { serverFetch } from '../api-client';
import type { ApiResponse } from '../types/common';
import type { Slider, Banner, FlashDeal } from '../types/slider';

export async function getSliders() {
  return serverFetch<ApiResponse<Slider[]>>('/sliders', { revalidate: 120, tags: ['sliders'] });
}

export async function getBannersOne() {
  return serverFetch<ApiResponse<Banner[]>>('/banners-one', { revalidate: 120, tags: ['banners'] });
}

export async function getBannersTwo() {
  return serverFetch<ApiResponse<Banner[]>>('/banners-two', { revalidate: 120, tags: ['banners'] });
}

export async function getBannersThree() {
  return serverFetch<ApiResponse<Banner[]>>('/banners-three', { revalidate: 120, tags: ['banners'] });
}

export async function getFlashDeals() {
  return serverFetch<ApiResponse<FlashDeal[]>>('/flash-deals', { revalidate: 60, tags: ['flash-deals'] });
}

export async function getFlashDealInfo(slug: string) {
  return serverFetch<ApiResponse<FlashDeal>>(`/flash-deals/info/${slug}`, { revalidate: 60 });
}

export async function getFlashDealProducts(id: number) {
  return serverFetch<ApiResponse<unknown[]>>(`/flash-deal-products/${id}`, { revalidate: 60 });
}

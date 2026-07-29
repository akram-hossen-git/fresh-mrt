import { apiFetch, serverFetch } from '../api-client';
import type { ApiResponse, ActionResponse } from '../types/common';
import type { Address, Country, State, City, Area } from '../types/address';

export async function getAddresses() {
  return apiFetch<ApiResponse<Address[]>>('/user/shipping/address');
}

export async function createAddress(data: Record<string, unknown>) {
  return apiFetch<ActionResponse>('/user/shipping/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAddress(data: Record<string, unknown>) {
  return apiFetch<ActionResponse>('/user/shipping/update', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: number) {
  return apiFetch<ActionResponse>(`/user/shipping/delete/${id}`);
}

export async function makeDefault(addressId: number) {
  return apiFetch<ActionResponse>('/user/shipping/make_default', {
    method: 'POST',
    body: JSON.stringify({ id: addressId }),
  });
}

export async function getCountries() {
  return serverFetch<ApiResponse<Country[]>>('/countries', { revalidate: 86400 });
}

export async function getStatesByCountry(countryId: number) {
  return serverFetch<ApiResponse<State[]>>(`/states-by-country/${countryId}`, { revalidate: 86400 });
}

export async function getCitiesByState(stateId: number) {
  return serverFetch<ApiResponse<City[]>>(`/cities-by-state/${stateId}`, { revalidate: 86400 });
}

export async function getAreasByCity(cityId: number) {
  return serverFetch<ApiResponse<Area[]>>(`/areas-by-city/${cityId}`, { revalidate: 86400 });
}

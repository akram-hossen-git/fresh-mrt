import { apiFetch } from '../api-client';
import type { ActionResponse } from '../types/common';

export interface OrderShippingAddress {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  lat_lang?: string;
}

export interface OrderDetail {
  id: number;
  code: string;
  user_id: number;
  shipping_address: OrderShippingAddress | null;
  payment_type: string;
  pickup_point: unknown | null;
  shipping_type: string | null;
  shipping_type_string: string;
  payment_status: string;
  payment_status_string: string;
  delivery_status: string;
  delivery_status_string: string;
  grand_total: string;
  plane_grand_total: string;
  coupon_discount: string;
  shipping_cost: string;
  subtotal: string;
  tax: string;
  date: string;
  cancel_request: boolean;
  manually_payable: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  variation: string | null;
  image: string | null;
  unit_price: string;
  price: string;
  tax: string;
  shipping_cost: string;
  coupon_discount: string;
  quantity: number;
  payment_status: string;
  payment_status_string: string;
  delivery_status: string;
  delivery_status_string: string;
  refund_section: boolean;
  refund_button: boolean;
  refund_label: string;
  refund_request_status: number;
}

interface OrderDetailResponse {
  data: OrderDetail[];
  success: boolean;
  status: number;
}

interface OrderItemsResponse {
  data: OrderItem[];
  success: boolean;
  status: number;
}

export async function getOrderDetails(id: number) {
  return apiFetch<OrderDetailResponse>(`/purchase-history-details/${id}`);
}

export async function getOrderItems(id: number) {
  return apiFetch<OrderItemsResponse>(`/purchase-history-items/${id}`);
}

export async function cancelOrder(id: number) {
  return apiFetch<ActionResponse>(`/order/cancel/${id}`);
}

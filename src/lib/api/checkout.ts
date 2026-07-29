import { apiFetch } from '../api-client';
import type { ActionResponse } from '../types/common';

export async function applyCoupon(code: string, userId: number) {
  return apiFetch<ActionResponse>('/coupon-apply', {
    method: 'POST',
    body: JSON.stringify({ coupon_code: code, user_id: userId }),
  });
}

export async function removeCoupon(userId: number) {
  return apiFetch<ActionResponse>('/coupon-remove', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function getDeliveryInfo(data: Record<string, unknown>) {
  return apiFetch<unknown[]>('/delivery-info', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getShippingCost(data: Record<string, unknown>) {
  return apiFetch<ActionResponse>('/shipping_cost', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPaymentTypes() {
  return apiFetch<Array<{ payment_type: string; payment_type_key: string; name: string; title: string; image: string; offline_payment_id: number; details: string }>>('/payment-types');
}

export async function updateAddressInCart(data: { user_id: number; address_id: number }) {
  return apiFetch<ActionResponse>('/update-address-in-cart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function placeOrder(data: Record<string, unknown>) {
  return apiFetch<ActionResponse>('/order/store', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function payCod(data: Record<string, unknown>) {
  return apiFetch<ActionResponse>('/payments/pay/cod', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function payWallet(data: Record<string, unknown>) {
  return apiFetch<ActionResponse>('/payments/pay/wallet', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

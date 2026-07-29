'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Package, MapPin, XCircle } from 'lucide-react';
import { useToast } from '@/context/toast-context';
import {
  getOrderDetails,
  getOrderItems,
  cancelOrder,
  type OrderDetail,
  type OrderItem,
} from '@/lib/api/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';

function getStatusBadgeVariant(
  status: string
): 'success' | 'warning' | 'danger' | 'default' {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'delivered':
      return 'success';
    case 'pending':
    case 'on_the_way':
    case 'processing':
    case 'confirmed':
      return 'warning';
    case 'cancelled':
    case 'failed':
      return 'danger';
    default:
      return 'default';
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailsRes, itemsRes] = await Promise.all([
        getOrderDetails(orderId),
        getOrderItems(orderId),
      ]);
      if (detailsRes.success && detailsRes.data?.length > 0) {
        setOrder(detailsRes.data[0]);
      } else {
        setNotFound(true);
      }
      if (itemsRes.success && itemsRes.data) {
        setItems(itemsRes.data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!Number.isNaN(orderId)) {
      fetchOrder();
    } else {
      setNotFound(true);
      setIsLoading(false);
    }
  }, [fetchOrder, orderId]);

  const canCancel =
    order?.delivery_status === 'pending' &&
    order?.payment_status === 'unpaid';

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelOrder(orderId);
      if (res.result) {
        showToast(res.message || 'Order cancelled successfully', 'success');
        setShowCancelModal(false);
        await fetchOrder();
      } else {
        showToast(res.message || 'Unable to cancel this order', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="w-40 h-6 mb-6" />
        <div className="space-y-4">
          <Skeleton className="w-full h-32 rounded-card" />
          <Skeleton className="w-full h-48 rounded-card" />
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="text-center py-16 rounded-card bg-white dark:bg-gray-900 shadow-subtle">
        <Package size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Order not found.
        </p>
        <Link
          href="/account/orders"
          className="text-sm text-accent font-medium hover:underline"
        >
          Back to my orders
        </Link>
      </div>
    );
  }

  const address = order.shipping_address;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/account/orders')}
          className="inline-flex items-center justify-center w-9 h-9 rounded-[8px] text-gray-500 hover:text-black hover:bg-gray-100 transition-all duration-300 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
          aria-label="Back to orders"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
            Order {order.code}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Placed on {order.date}
          </p>
        </div>
      </div>

      {/* Status + summary card */}
      <div className="p-5 rounded-card bg-white dark:bg-gray-900 shadow-subtle mb-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant={getStatusBadgeVariant(order.payment_status)} size="md">
            {order.payment_status_string || order.payment_status}
          </Badge>
          <Badge variant={getStatusBadgeVariant(order.delivery_status)} size="md">
            {order.delivery_status_string || order.delivery_status}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {order.payment_type}
          </span>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Subtotal</dt>
            <dd className="text-gray-900 dark:text-white tabular-nums">{order.subtotal}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
            <dd className="text-gray-900 dark:text-white tabular-nums">{order.tax}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Shipping</dt>
            <dd className="text-gray-900 dark:text-white tabular-nums">{order.shipping_cost}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Coupon discount</dt>
            <dd className="text-gray-900 dark:text-white tabular-nums">-{order.coupon_discount}</dd>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <dt className="font-semibold text-gray-900 dark:text-white">Total</dt>
            <dd className="font-bold text-gray-900 dark:text-white tabular-nums">{order.grand_total}</dd>
          </div>
        </dl>
      </div>

      {/* Shipping address */}
      {address && (address.name || address.address) && (
        <div className="p-5 rounded-card bg-white dark:bg-gray-900 shadow-subtle mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Shipping Address
            </h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-0.5">
            {address.name && <p className="font-medium text-gray-900 dark:text-white">{address.name}</p>}
            {address.phone && <p>{address.phone}</p>}
            {address.email && <p>{address.email}</p>}
            <p>
              {[address.address, address.city, address.state, address.postal_code]
                .filter(Boolean)
                .join(', ')}
            </p>
            {address.country && <p>{address.country}</p>}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="p-5 rounded-card bg-white dark:bg-gray-900 shadow-subtle mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Items ({items.length})
        </h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 shrink-0 rounded-[8px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Package size={20} className="text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {item.product_name}
                  </p>
                  {item.variation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.variation}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
                    {item.quantity} × {item.unit_price}
                  </p>
                </div>

                {/* Line total */}
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums shrink-0">
                  {item.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel action */}
      {canCancel && (
        <div className="flex justify-end">
          <Button
            variant="danger"
            size="md"
            icon={<XCircle size={18} />}
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Order
          </Button>
        </div>
      )}

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to cancel order {order.code}? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setShowCancelModal(false)}
            disabled={isCancelling}
          >
            Keep Order
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleCancel}
            isLoading={isCancelling}
          >
            Cancel Order
          </Button>
        </div>
      </Modal>
    </div>
  );
}

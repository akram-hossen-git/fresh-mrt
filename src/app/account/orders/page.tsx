'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderItem {
  id: number;
  code: string;
  date: string;
  grand_total: string;
  payment_status: string;
  payment_status_string: string;
  delivery_status: string;
  delivery_status_string: string;
}

interface PurchaseHistoryResponse {
  data: OrderItem[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
  success: boolean;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await apiFetch<PurchaseHistoryResponse>(
        `/purchase-history?page=${page}`
      );
      if (res.success && res.data) {
        setOrders(res.data);
        if (res.meta) {
          setTotalPages(res.meta.last_page);
        }
      }
    } catch {
      // Silent fail; empty state will show
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
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
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-6">
          My Orders
        </h2>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-20 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-6">
        My Orders
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 rounded-card bg-white dark:bg-gray-900 shadow-subtle">
          <Package size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No orders yet.</p>
          <a
            href="/"
            className="text-sm text-accent font-medium hover:underline"
          >
            Start shopping!
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block p-4 sm:p-5 rounded-card bg-white dark:bg-gray-900 shadow-subtle hover:shadow-card transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Order info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.date}
                    </p>
                  </div>

                  {/* Status badges and price */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={getStatusBadgeVariant(order.payment_status)} size="sm">
                      {order.payment_status_string || order.payment_status}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(order.delivery_status)} size="sm">
                      {order.delivery_status_string || order.delivery_status}
                    </Badge>
                    <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                      {order.grand_total}
                    </span>
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}

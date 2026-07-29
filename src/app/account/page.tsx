'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Heart, Wallet, ArrowRight, MapPin, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface OrderPreview {
  id: number;
  code: string;
  date: string;
  grand_total: string;
  payment_status: string;
  delivery_status: string;
}

export default function AccountDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<OrderPreview[]>([]);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, wallet: '$ 0.00' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch purchase history for recent orders
        const { apiFetch } = await import('@/lib/api-client');
        const res = await apiFetch<{
          data: Array<{
            id: number;
            code: string;
            date: string;
            grand_total: string;
            payment_status: string;
            delivery_status: string;
          }>;
          success: boolean;
        }>('/purchase-history');

        if (res.success && res.data) {
          setRecentOrders(res.data.slice(0, 3));
          setStats((s) => ({ ...s, orders: res.data.length }));
        }
      } catch {
        // Dashboard data is non-critical
      }

      try {
        const { getWishlist } = await import('@/lib/api/wishlists');
        const wishRes = await getWishlist();
        if (wishRes.success && wishRes.data) {
          setStats((s) => ({ ...s, wishlist: wishRes.data.length }));
        }
      } catch {
        // Non-critical
      }

      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s a quick overview of your account
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-card" />
          ))
        ) : (
          <>
            <Link
              href="/account/orders"
              className="flex items-center gap-4 p-5 rounded-card bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Package size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.orders}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
              </div>
            </Link>

            <Link
              href="/account/wishlist"
              className="flex items-center gap-4 p-5 rounded-card bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center shrink-0">
                <Heart size={20} className="text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wishlist}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wishlist Items</p>
              </div>
            </Link>

            <div className="flex items-center gap-4 p-5 rounded-card bg-white dark:bg-gray-900 shadow-card">
              <div className="w-11 h-11 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                <Wallet size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wallet}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">
            Recent Orders
          </h3>
          <Link
            href="/account/orders"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-card" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 rounded-card bg-white dark:bg-gray-900 shadow-subtle">
            <Package size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No orders yet. Start shopping!</p>
            <Link
              href="/"
              className="text-sm text-accent font-medium hover:underline"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-card bg-white dark:bg-gray-900 shadow-subtle hover:shadow-card transition-all duration-300"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.code}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {order.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusBadgeVariant(order.payment_status)} size="sm">
                    {order.payment_status}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(order.delivery_status)} size="sm">
                    {order.delivery_status}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                    {order.grand_total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
        {[
          { href: '/account/orders', label: 'My Orders', icon: Package },
          { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
          { href: '/account/addresses', label: 'Addresses', icon: MapPin },
          { href: '/account/profile', label: 'Profile', icon: User },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2 p-4 rounded-card bg-white dark:bg-gray-900 shadow-subtle hover:shadow-card text-center transition-all duration-300 group"
            >
              <Icon
                size={22}
                className="text-gray-400 dark:text-gray-500 group-hover:text-accent transition-colors"
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile', icon: User },
] as const;

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Skeleton className="w-48 mb-8" height={32} />
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full" height={44} />
            ))}
          </div>
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isActive = (href: string) => {
    if (href === '/account') return pathname === '/account';
    return pathname.startsWith(href);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Page heading */}
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-8">
        My Account
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar — desktop / Horizontal tabs — mobile */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-sm font-medium whitespace-nowrap transition-all duration-300',
                  active
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-300 whitespace-nowrap"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        {/* Content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

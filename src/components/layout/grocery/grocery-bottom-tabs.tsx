'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';

/* ------------------------------------------------------------------ */
/*  Grocery Bottom Tab Bar                                             */
/*                                                                     */
/*  Locked wireframe (2026-07-28):                                     */
/*    Home · Categories · Cart · Profile                               */
/*                                                                     */
/*  Differences vs the fashion <MobileNav />:                          */
/*    - Categories NAVIGATES to /categories (the new two-pane page),   */
/*      it does NOT open the old sliding MobileCategoryDrawer.         */
/*    - Hidden at `lg` (not `md`) so it matches GroceryHeader, which   */
/*      keeps the mobile header through the tablet range.              */
/*    - Active tab gets an accent top-rail + accent icon/label.        */
/* ------------------------------------------------------------------ */

const TABS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Categories', href: '/categories', icon: LayoutGrid },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Profile', href: '/account', icon: User },
] as const;

export function GroceryBottomTabBar() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 lg:hidden',
        'bg-white border-t border-neutral-200',
        'dark:bg-neutral-950 dark:border-neutral-800',
        'pb-[env(safe-area-inset-bottom)]',
      )}
      aria-label="Primary"
    >
      <div className="grid h-14 grid-cols-4">
        {TABS.map((tab) => {
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                'text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-accent'
                  : 'text-neutral-500 dark:text-neutral-400',
              )}
            >
              {/* Active rail */}
              {isActive && (
                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-accent" />
              )}

              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                {tab.label === 'Cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useCategoryMenu } from '@/context/category-menu-context';
import { MobileCategoryDrawer } from '@/components/layout/mobile-category-drawer';

export function MobileNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { categories } = useCategoryMenu();
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  const tabs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', href: '/categories', icon: Grid3X3, action: true },
    { label: 'Cart', href: '/cart', icon: ShoppingBag },
    { label: 'Account', href: '/account', icon: User },
  ] as const;

  return (
    <>
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 md:hidden',
          'bg-white border-t border-neutral-200',
          'dark:bg-black dark:border-neutral-800',
          'pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <div className="grid grid-cols-4 h-14">
          {tabs.map((tab) => {
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            // Categories tab opens drawer instead of navigating
            if ('action' in tab && tab.action) {
              return (
                <button
                  key={tab.label}
                  onClick={() => setCategoryDrawerOpen(true)}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                    isActive
                      ? 'text-accent'
                      : 'text-neutral-500 dark:text-neutral-400',
                  )}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-accent'
                    : 'text-neutral-500 dark:text-neutral-400',
                )}
              >
                <div className="relative">
                  <Icon size={20} />
                  {tab.label === 'Cart' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-accent rounded-full">
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

      <MobileCategoryDrawer
        categories={categories}
        isOpen={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
      />
    </>
  );
}

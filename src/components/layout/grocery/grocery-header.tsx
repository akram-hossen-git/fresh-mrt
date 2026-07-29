'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useCategoryMenu } from '@/context/category-menu-context';
import { SearchBar } from '@/components/layout/search-bar';
import { MegaMenu } from '@/components/layout/mega-menu';
import { DeliveryPill } from '@/components/layout/grocery/delivery-pill';
import { GroceryCartDrawer } from '@/components/cart/grocery/grocery-cart-drawer';
import { storeConfig } from '@/config/store.config';

/* ------------------------------------------------------------------ */
/*  Grocery Header                                                     */
/*                                                                     */
/*  Locked wireframe (2026-07-28):                                     */
/*                                                                     */
/*  DESKTOP 2-row:                                                     */
/*    Row 1: Logo (font-body) | DeliveryPill | inline search | Account */
/*            | Cart(subtotal+count)                                   */
/*    Row 2: green bg-accent department bar with category shortcuts    */
/*                                                                     */
/*  MOBILE:                                                            */
/*    Top bar: Logo | DeliveryPill | Cart                              */
/*    Sticky search below top bar (always visible, NOT behind icon)    */
/*    Bottom tabs handled separately by GroceryBottomTabBar            */
/* ------------------------------------------------------------------ */

/** Quick-links for the desktop department bar (row 2) */
const QUICK_LINKS = [
  { label: 'Offers', href: '/search?sort_key=popularity' },
  { label: 'Flash Deals', href: '/flash-deals' },
];

/** Max number of category shortcuts in the green bar */
const MAX_DEPARTMENT_SHORTCUTS = 6;

export function GroceryHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, cartSubtotal } = useCart();
  const { categories } = useCategoryMenu();

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* ---- Scroll shadow ---- */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ---- Close user dropdown on outside click ---- */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const departmentShortcuts = categories.slice(0, MAX_DEPARTMENT_SHORTCUTS);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm transition-shadow duration-300',
          'dark:bg-neutral-950/95',
          scrolled && 'shadow-md',
        )}
        /* Grocery header is taller than the fashion one (row1 h-16 + green
           row2 h-10 + border). MegaMenu's dropdown is positioned with
           --header-height, so scope an override here rather than changing
           the global 96px value that fashion depends on. */
        style={{ '--header-height': '105px' } as React.CSSProperties}
      >
        {/* ============================================================ */}
        {/*  ROW 1 — Main header bar                                     */}
        {/* ============================================================ */}
        <div className="border-b border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto">
            {/* ---- DESKTOP Row 1 ---- */}
            <div className="hidden lg:flex items-center gap-4 h-16">
              {/* Logo — font-body, not uppercase display */}
              <Link
                href="/"
                className="shrink-0 text-xl font-bold text-accent"
              >
                {storeConfig.content.name}
              </Link>

              {/* Delivery pill */}
              <DeliveryPill variant="stacked" className="shrink-0 ml-2" />

              {/* Search bar — inline, always visible */}
              <div className="flex-1 max-w-xl mx-4">
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    'flex items-center gap-2 w-full h-10 px-4',
                    'rounded-[var(--radius-button)] border border-neutral-200 dark:border-neutral-700',
                    'bg-neutral-50 dark:bg-neutral-900',
                    'text-sm text-neutral-400 dark:text-neutral-500',
                    'hover:border-accent/50 transition-colors',
                  )}
                >
                  <Search size={16} className="shrink-0" />
                  <span>Search &quot;milk&quot;, &quot;rice&quot;, &quot;eggs&quot;...</span>
                </button>
              </div>

              {/* Account dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                  aria-label="Account"
                >
                  <User size={20} />
                  {isAuthenticated && (
                    <>
                      <span className="hidden xl:inline text-sm font-medium truncate max-w-[100px]">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          'transition-transform duration-200',
                          userMenuOpen && 'rotate-180',
                        )}
                      />
                    </>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-950 shadow-xl rounded-[var(--radius-card)] border border-neutral-200 dark:border-neutral-800 py-1 animate-fade-in z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                            {user?.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-neutral-400">
                            {user?.email}
                          </p>
                        </div>
                        {[
                          { label: 'Profile', href: '/account' },
                          { label: 'Orders', href: '/account/orders' },
                          { label: 'Wishlist', href: '/account/wishlist' },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="block px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth/register"
                          className="block px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart — opens the quick-review drawer (desktop only; mobile
                  goes to the full /cart page per the locked wireframe) */}
              <button
                onClick={() => setCartOpen(true)}
                className={cn(
                  'flex items-center gap-2 h-10 px-4',
                  'rounded-[var(--radius-button)]',
                  'bg-accent text-white',
                  'hover:bg-accent-dark transition-colors',
                  'text-sm font-medium',
                )}
                aria-label="Open cart"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 ? (
                  <>
                    <span className="hidden sm:inline">{cartSubtotal || `(${cartCount})`}</span>
                    <span className="text-white/80 text-xs">({cartCount})</span>
                  </>
                ) : (
                  <span>Cart</span>
                )}
              </button>
            </div>

            {/* ---- MOBILE Row 1: logo + delivery pill + cart ---- */}
            <div className="flex lg:hidden items-center justify-between h-14 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  href="/"
                  className="shrink-0 text-lg font-bold text-accent"
                >
                  {storeConfig.content.name}
                </Link>
                <DeliveryPill variant="inline" className="min-w-0" />
              </div>

              <Link
                href="/cart"
                className="relative shrink-0 p-2 text-neutral-700 dark:text-neutral-300"
                aria-label="Cart"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-accent rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* ---- MOBILE sticky search bar ---- */}
            <div className="lg:hidden pb-2 px-1">
              <button
                onClick={() => setSearchOpen(true)}
                className={cn(
                  'flex items-center gap-2 w-full h-10 px-3',
                  'rounded-[var(--radius-button)] border border-neutral-200 dark:border-neutral-700',
                  'bg-neutral-50 dark:bg-neutral-900',
                  'text-sm text-neutral-400 dark:text-neutral-500',
                )}
              >
                <Search size={16} className="shrink-0" />
                <span>Search &quot;milk&quot;, &quot;rice&quot;...</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  ROW 2 — Green department bar (desktop only)                 */}
        {/* ============================================================ */}
        <div className="hidden lg:block bg-accent text-white">
          <div className="container mx-auto">
            <div className="flex items-center h-10 gap-1">
              {/* All Departments button — triggers existing MegaMenu */}
              <MegaMenu categories={categories} variant="grocery" />

              {/* Separator */}
              <span className="w-px h-5 bg-white/20 mx-1" />

              {/* Category shortcuts */}
              {departmentShortcuts.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-[var(--radius-button)] transition-colors"
                >
                  {cat.icon && (
                    <Image
                      src={cat.icon}
                      alt=""
                      width={16}
                      height={16}
                      className="rounded-sm object-contain"
                    />
                  )}
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Quick links: Offers, Flash Deals */}
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-[var(--radius-button)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ---- Search overlay (shared desktop + mobile) ---- */}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ---- Cart drawer (desktop quick review) ---- */}
      <GroceryCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

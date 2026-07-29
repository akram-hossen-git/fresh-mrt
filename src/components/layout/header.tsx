'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { useTheme } from '@/context/theme-context';
import { useCategoryMenu } from '@/context/category-menu-context';
import { SearchBar } from '@/components/layout/search-bar';
import { MegaMenu } from '@/components/layout/mega-menu';
import { MobileCategoryDrawer } from '@/components/layout/mobile-category-drawer';
import { storeConfig } from '@/config/store.config';

const navLinks = [
  { label: 'Shop', href: '/search' },
  { label: 'Shops', href: '/shops' },
  { label: 'Flash Deals', href: '/flash-deals' },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { categories } = useCategoryMenu();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* ---- scroll shadow and direction-based visibility ---- */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 10);
      setHeaderHidden(
        currentScrollY > lastScrollY.current && currentScrollY > 8,
      );
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ---- close user dropdown on outside click ---- */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  /* ---- lock body scroll when mobile menu is open ---- */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm transition-[transform,box-shadow] duration-300 ease-out will-change-transform',
          'dark:bg-black/95',
          'font-sans',
          scrolled && 'shadow-md',
          headerHidden && '-translate-y-full',
        )}
      >
        {/* ---- Top announcement bar ---- */}
        <div className="bg-black text-white dark:bg-white dark:text-black">
          <p className="text-center py-2 font-display text-[10px] font-semibold uppercase tracking-[0.25em] sm:text-[11px]">
            {storeConfig.content.announcement}
          </p>
        </div>

        {/* ---- Main header row ---- */}
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <Link
                href="/"
                className="font-display text-2xl font-black leading-none tracking-[0.15em] text-black dark:text-white"
              >
                {storeConfig.content.name}
              </Link>
            </div>

            {/* Center: desktop navigation */}
            <nav className="hidden lg:flex items-center gap-7">
              <MegaMenu categories={categories} />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: action icons */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search size={19} />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
              </button>

              <Link
                href="/account/wishlist"
                className="hidden sm:flex p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={19} />
              </Link>

              <Link
                href="/cart"
                className="relative p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-accent">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1 p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors"
                  aria-label="Account"
                >
                  <User size={19} />
                  {isAuthenticated && (
                    <ChevronDown
                      size={13}
                      className={cn(
                        'hidden sm:block transition-transform duration-200',
                        userMenuOpen && 'rotate-180',
                      )}
                    />
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-950 shadow-xl border border-neutral-200 dark:border-neutral-800 py-1 animate-fade-in">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                          <p className="truncate font-display text-xs font-bold uppercase tracking-[0.1em] text-neutral-900 dark:text-white">
                            {user?.name}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-neutral-400">
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
                            className="block px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left font-display text-xs font-semibold uppercase tracking-[0.1em] text-accent hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="block px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth/register"
                          className="block px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.1em] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---- Search overlay ---- */}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ---- Mobile slide-in menu ---- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel */}
          <aside className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-black shadow-2xl flex flex-col animate-slide-in-left">
            {/* Panel header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-display text-xl font-black leading-none tracking-[0.15em]">
                milam
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-neutral-700 dark:text-neutral-300"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-0.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTimeout(() => setMobileCategoryOpen(true), 100);
                }}
                className="flex w-full items-center justify-between px-3 py-3 font-display text-sm font-semibold uppercase tracking-[0.1em] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Categories
                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
              </button>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-3 font-display text-sm font-semibold uppercase tracking-[0.1em] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Bottom CTA for guests */}
            {!isAuthenticated && (
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href="/auth/login"
                  className="block w-full bg-black py-3 text-center font-display text-xs font-bold uppercase tracking-[0.16em] text-white dark:bg-white dark:text-black hover:bg-accent hover:border-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ---- Mobile category drawer ---- */}
      <MobileCategoryDrawer
        categories={categories}
        isOpen={mobileCategoryOpen}
        onClose={() => setMobileCategoryOpen(false)}
      />

      {/* Mobile menu slide-in animation */}
      <style jsx global>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

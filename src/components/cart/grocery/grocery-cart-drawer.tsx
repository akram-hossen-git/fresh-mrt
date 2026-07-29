'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { getCartItems } from '@/lib/api/cart';
import { SameDayCutoff } from '@/components/home/grocery/same-day-cutoff';
import type { CartItem } from '@/lib/types/cart';

/* ------------------------------------------------------------------ */
/*  Grocery Cart Drawer                                                */
/*                                                                     */
/*  Locked wireframe (2026-07-28):                                     */
/*    "Desktop: cart button opens right slide-in DRAWER (quick review  */
/*     while browsing) + full /cart page stays for final review."      */
/*                                                                     */
/*  So this is a quick-review surface, not a checkout step: same-day    */
/*  cutoff line, rows with thumbnail + inline − qty +, subtotal, and    */
/*  two exits (View Cart / Checkout).                                  */
/*                                                                     */
/*  Deliberately NOT here yet: the delivery fee line and the           */
/*  free-delivery progress bar. Both need a real number from           */
/*  POST /shipping_cost, which isn't wired yet — showing a made-up     */
/*  threshold would be worse than showing nothing.                     */
/* ------------------------------------------------------------------ */

interface GroceryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GroceryCartDrawer({ isOpen, onClose }: GroceryCartDrawerProps) {
  const { user, isAuthenticated } = useAuth();
  const {
    cartCount,
    cartSubtotal,
    tempUserId,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  /* ---- Load items when the drawer opens, and after any cart change ---- */
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const tid = !isAuthenticated ? (tempUserId ?? undefined) : undefined;
        const res = await getCartItems(user?.id, tid);
        if (!cancelled) setItems(res.data ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
    // cartCount in deps → re-fetch after add/remove so the drawer stays truthful
  }, [isOpen, cartCount, user?.id, isAuthenticated, tempUserId]);

  /* ---- Escape to close ---- */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  /* ---- Lock body scroll while open ---- */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const changeQty = useCallback(
    async (item: CartItem, next: number) => {
      if (busyId !== null) return;
      setBusyId(item.id);
      try {
        if (next < 1) {
          await removeFromCart(item.id);
        } else {
          await updateQuantity(item.id, next);
        }
      } catch {
        // refreshCart in context will reconcile; keep the drawer quiet
      } finally {
        setBusyId(null);
      }
    },
    [busyId, removeFromCart, updateQuantity],
  );

  const isEmpty = !loading && items.length === 0;

  return (
    <>
      {/* ---- Backdrop ---- */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
      />

      {/* ---- Panel ---- */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-[61] flex h-full w-full max-w-[400px] flex-col',
          'bg-white shadow-2xl transition-transform duration-300 ease-out',
          'dark:bg-neutral-950',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            My Cart{' '}
            {cartCount > 0 && (
              <span className="font-medium text-neutral-500">({cartCount})</span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="-mr-1 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---- Same-day cutoff strip ---- */}
        {!isEmpty && (
          <div className="border-b border-accent/20 bg-accent-light px-4 py-2 dark:bg-accent/10">
            <SameDayCutoff className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-dark dark:text-accent" />
          </div>
        )}

        {/* ---- Body ---- */}
        <div className="flex-1 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={20} className="animate-spin text-neutral-400" />
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <ShoppingCart size={36} className="text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                Your cart is empty
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Add fresh picks and they&apos;ll show up here.
              </p>
              <button
                onClick={onClose}
                className="mt-1 rounded-[var(--radius-button)] bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Start shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {items.map((item) => {
                const busy = busyId === item.id;
                const atCap =
                  typeof item.stock === 'number' && item.quantity >= item.stock;

                return (
                  <li key={item.id} className="flex gap-3 px-4 py-3">
                    {/* Thumbnail */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-button)] bg-neutral-50 dark:bg-neutral-900">
                      <Image
                        src={item.product.image}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-neutral-900 dark:text-white">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        {[item.variation, item.product.unit]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        {/* Stepper */}
                        <div className="flex items-center rounded-[var(--radius-button)] border border-accent text-accent-dark dark:text-accent">
                          <button
                            onClick={() => changeQty(item, item.quantity - 1)}
                            disabled={busy}
                            className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-accent-light disabled:opacity-50 dark:hover:bg-accent/10"
                            aria-label={
                              item.quantity <= 1 ? 'Remove item' : 'Decrease quantity'
                            }
                          >
                            {item.quantity <= 1 ? (
                              <Trash2 size={12} />
                            ) : (
                              <Minus size={12} strokeWidth={3} />
                            )}
                          </button>
                          <span className="min-w-[22px] text-center text-xs font-bold tabular-nums">
                            {busy ? '·' : item.quantity}
                          </span>
                          <button
                            onClick={() => changeQty(item, item.quantity + 1)}
                            disabled={busy || atCap}
                            className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-accent-light disabled:opacity-40 dark:hover:bg-accent/10"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>

                        <span className="shrink-0 text-sm font-bold text-neutral-900 dark:text-white">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ---- Footer ---- */}
        {!isEmpty && (
          <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Subtotal
              </span>
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                {cartSubtotal || '—'}
              </span>
            </div>
            <p className="mb-3 text-[11px] text-neutral-500 dark:text-neutral-400">
              Delivery calculated at checkout.
            </p>

            <div className="flex gap-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="flex flex-1 items-center justify-center rounded-[var(--radius-button)] border border-neutral-300 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex flex-[1.4] items-center justify-center rounded-[var(--radius-button)] bg-accent py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-accent-dark"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

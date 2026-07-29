'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { cn, getDiscountPercent } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';
import type { ProductMini } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Grocery Product Card                                               */
/*                                                                     */
/*  Locked wireframe (2026-07-28):                                     */
/*    image + discount badge / name / pack size / price + strikethrough */
/*    / ADD button ALWAYS VISIBLE → tap = inline − qty + stepper        */
/*                                                                     */
/*  Deliberately different from product-card-square.tsx (fashion):     */
/*    - No hover-reveal. Grocery is touch-first; a hidden button is an  */
/*      unusable button on a phone.                                    */
/*    - No wishlist heart. Grocery repeat-buying is served by "Buy      */
/*      Again", not wishlists.                                         */
/*    - No rating stars. Shelf-stable goods rarely differentiate on     */
/*      star rating, and the space is better spent on pack size.        */
/*    - Adds directly to cart. Products that genuinely need a variant   */
/*      chosen (has_variants) route to the detail page instead of       */
/*      guessing a pack for the user.                                   */
/* ------------------------------------------------------------------ */

interface ProductCardGroceryProps {
  product: ProductMini;
  className?: string;
}

export function ProductCardGrocery({ product, className }: ProductCardGroceryProps) {
  const router = useRouter();
  const { addToCart, updateQuantity, removeFromCart, getLine } = useCart();
  const { showToast } = useToast();

  const [busy, setBusy] = useState(false);

  const line = getLine(product.id);
  const quantity = line?.quantity ?? 0;

  const discountPercent = product.has_discount
    ? getDiscountPercent(product.discount)
    : 0;

  const outOfStock =
    typeof product.current_stock === 'number' && product.current_stock <= 0;

  /** Stock ceiling: prefer the cart line's variant stock, fall back to product stock. */
  const stockCap = line?.stock ?? product.current_stock;
  const atStockCap = typeof stockCap === 'number' && quantity >= stockCap;

  const handleAdd = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy || outOfStock) return;

      // Needs a pack size / variant chosen — send them to the detail page
      // rather than silently adding an arbitrary combination.
      if (product.has_variants) {
        router.push(`/products/${product.slug}`);
        return;
      }

      setBusy(true);
      try {
        await addToCart(product.id, '', Math.max(1, product.min_qty ?? 1));
        showToast(`${product.name} added to cart`, 'success');
      } catch {
        showToast('Could not add to cart. Please try again.', 'error');
      } finally {
        setBusy(false);
      }
    },
    [busy, outOfStock, product, addToCart, showToast, router],
  );

  const handleIncrement = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy || !line || atStockCap) return;
      setBusy(true);
      try {
        await updateQuantity(line.cartId, quantity + 1);
      } catch {
        showToast('Could not update quantity.', 'error');
      } finally {
        setBusy(false);
      }
    },
    [busy, line, atStockCap, quantity, updateQuantity, showToast],
  );

  const handleDecrement = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (busy || !line) return;
      setBusy(true);
      try {
        const min = Math.max(1, product.min_qty ?? 1);
        if (quantity <= min) {
          await removeFromCart(line.cartId);
        } else {
          await updateQuantity(line.cartId, quantity - 1);
        }
      } catch {
        showToast('Could not update quantity.', 'error');
      } finally {
        setBusy(false);
      }
    },
    [busy, line, quantity, product.min_qty, removeFromCart, updateQuantity, showToast],
  );

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col',
        'rounded-[var(--radius-card)] border border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-950',
        'p-2.5 transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* ---- Image ---- */}
      <Link
        href={`/products/${product.slug}`}
        className="relative mb-2 block aspect-square overflow-hidden rounded-[var(--radius-button)] bg-neutral-50 dark:bg-neutral-900"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={product.thumbnail_image}
          alt=""
          fill
          className={cn(
            'object-contain transition-transform duration-300 group-hover:scale-105',
            outOfStock && 'opacity-40 grayscale',
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {product.has_discount && discountPercent > 0 && !outOfStock && (
          <span className="absolute left-1.5 top-1.5 rounded-[var(--radius-badge)] bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
            {discountPercent}% OFF
          </span>
        )}

        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-neutral-900/80 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </Link>

      {/* ---- Pack size ---- */}
      {product.unit && (
        <p className="mb-0.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
          {product.unit}
        </p>
      )}

      {/* ---- Name ---- */}
      <h3 className="mb-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-neutral-900 dark:text-white">
        <Link href={`/products/${product.slug}`} className="hover:text-accent">
          {product.name}
        </Link>
      </h3>

      {/* ---- Price + action pinned to the bottom so cards align ---- */}
      <div className="mt-auto flex items-end justify-between gap-2 pt-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
            {product.main_price}
          </p>
          {product.has_discount && product.stroked_price && (
            <p className="truncate text-[11px] text-neutral-400 line-through">
              {product.stroked_price}
            </p>
          )}
        </div>

        {/* ---- ADD / stepper ---- */}
        {outOfStock ? (
          <span className="shrink-0 rounded-[var(--radius-button)] border border-neutral-200 px-3 py-1.5 text-[11px] font-semibold text-neutral-400 dark:border-neutral-800">
            Notify
          </span>
        ) : quantity > 0 ? (
          <div
            className="flex shrink-0 items-center rounded-[var(--radius-button)] bg-accent text-white"
            role="group"
            aria-label={`Quantity for ${product.name}`}
          >
            <button
              onClick={handleDecrement}
              disabled={busy}
              className="flex h-8 w-8 items-center justify-center rounded-l-[var(--radius-button)] transition-colors hover:bg-accent-dark disabled:opacity-60"
              aria-label="Decrease quantity"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <span className="min-w-[24px] text-center text-xs font-bold tabular-nums">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={busy || atStockCap}
              className="flex h-8 w-8 items-center justify-center rounded-r-[var(--radius-button)] transition-colors hover:bg-accent-dark disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={busy}
            className={cn(
              'flex h-8 shrink-0 items-center justify-center gap-1 px-3.5',
              'rounded-[var(--radius-button)]',
              'border border-accent bg-accent-light text-accent-dark',
              'text-xs font-bold uppercase tracking-wide',
              'transition-colors hover:bg-accent hover:text-white',
              'disabled:opacity-60',
              'dark:bg-transparent dark:text-accent dark:hover:text-white',
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';

import { getVariantPrice } from '@/lib/api/products';
import { useProductVariant } from '@/components/product/product-variant-context';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';
import { cn } from '@/lib/utils';
import type { ProductDetail } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Grocery Buy Box (locked spec 2026-07-30)                           */
/*                                                                     */
/*  Owns BOTH the inline buy column and the mobile sticky bar, and     */
/*  renders the sticky bar as a sibling. This is deliberate: quantity  */
/*  and the add handler are local state, and the alternative — hoisting*/
/*  them into ProductVariantProvider so a separate sticky component    */
/*  could read them — would grow a context that exists only to sync    */
/*  the gallery with the price. One component, two renders, no shared  */
/*  mutable state.                                                     */
/*                                                                     */
/*  Sticky bar geometry is pinned to the real tab bar in               */
/*  layout/grocery/grocery-bottom-tabs.tsx: h-14 grid + safe-area      */
/*  padding, z-40, lg:hidden. So the bar sits at 3.5rem + inset, z-30, */
/*  and also hides at lg. Keep these in sync if the tab bar changes.   */
/*                                                                     */
/*  Differences vs the shared AddToCartSection:                        */
/*    - No wishlist button. Grocery repeat-buying is served by "Buy    */
/*      Again", the same call made on the grocery product card.        */
/*    - Pack-size chips instead of fashion swatch/size selectors.      */
/*    - Shows "Save ৳X" off base_price_numeric - calculable_price.     */
/* ------------------------------------------------------------------ */

interface GroceryBuyBoxProps {
  product: ProductDetail;
  slug: string;
}

interface LivePrice {
  price: string;
  stock: number;
  inStock: boolean;
}

export function GroceryBuyBox({ product, slug }: GroceryBuyBoxProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const variantCtx = useProductVariant();

  /* The context object identity changes on every provider state update.
     Reading it through a ref keeps it OUT of the selection effect's deps —
     otherwise writing the fetched price back into context would retrigger
     the effect, refetch, and loop forever. */
  const ctxRef = useRef(variantCtx);
  useEffect(() => {
    ctxRef.current = variantCtx;
  });

  const colors = product.colors ?? [];
  const choiceOptions = product.choice_options ?? [];
  const hasVariants = colors.length > 0 || choiceOptions.length > 0;

  const [colorIndex, setColorIndex] = useState(0);
  const [choices, setChoices] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    choiceOptions.forEach((choice) => {
      if (choice.options.length > 0) initial[choice.name] = choice.options[0];
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [livePrice, setLivePrice] = useState<LivePrice | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  /* Guards against out-of-order responses when chips are tapped quickly. */
  const requestSeq = useRef(0);

  /* ---- Derived selection ---- */
  const selection = useMemo(() => {
    const color = colors[colorIndex];
    const choiceValues: string[] = [];
    choiceOptions.forEach((choice) => {
      const value = choices[choice.name];
      if (value) choiceValues.push(value);
    });
    // Backend variant key: color name + choice values, spaces stripped, '-' joined.
    const parts = color?.name ? [color.name, ...choiceValues] : [...choiceValues];
    return {
      variantString: parts.map((p) => p.replace(/\s/g, '')).join('-'),
      colorCode: color?.code ?? '',
      choiceValues,
    };
  }, [colors, colorIndex, choiceOptions, choices]);

  const { variantString, colorCode, choiceValues } = selection;
  const choiceKey = choiceValues.join(',');

  /* ---- Sync context + fetch authoritative price/stock ---- */
  useEffect(() => {
    if (!hasVariants) return;

    // 1) Instant: let the gallery swap from already-loaded photos.
    ctxRef.current?.setSelectedVariant(variantString);
    ctxRef.current?.setSelectedColorCode(colorCode);

    // 2) Authoritative price/stock/image from the endpoint.
    const seq = ++requestSeq.current;
    getVariantPrice({
      id: product.id,
      slug,
      color: colorCode ? colorCode.replace('#', '') : '',
      variants: choiceKey,
      quantity: 1,
    })
      .then((res) => {
        if (seq !== requestSeq.current) return; // stale
        if (res.result && res.data) {
          setLivePrice({
            price: res.data.price,
            stock: res.data.stock,
            inStock: res.data.in_stock === 1,
          });
          ctxRef.current?.setPriceData({
            price: res.data.price,
            stock: res.data.stock,
            inStock: res.data.in_stock === 1,
            image: res.data.image,
            variant: res.data.variant,
          });
        }
      })
      .catch(() => {
        // Drop back to the base product price/stock rather than leaving the
        // PREVIOUS variant's figures on screen — otherwise a failed refetch
        // shows 500g pricing while 1kg is selected, and drives the stock cap.
        if (seq !== requestSeq.current) return;
        setLivePrice(null);
      });
  }, [hasVariants, variantString, colorCode, choiceKey, product.id, slug]);

  /* ---- Stock ---- */
  const inStock = livePrice ? livePrice.inStock : product.current_stock > 0;
  const availableStock = livePrice ? livePrice.stock : product.current_stock;
  const atCap = quantity >= Math.max(1, availableStock);

  // Clamp quantity down when a smaller-stock variant is picked.
  useEffect(() => {
    setQuantity((q) => (availableStock > 0 && q > availableStock ? availableStock : q));
  }, [availableStock]);

  /* ---- Price ---- */
  const displayPrice = livePrice?.price ?? product.main_price;

  // The variant endpoint returns one already-discounted price with no
  // "before" figure, so the strike and the savings line only make sense
  // on the base product price.
  const showBaseComparison = !livePrice;
  const savings =
    typeof product.base_price_numeric === 'number'
      ? product.base_price_numeric - product.calculable_price
      : 0;
  const showSavings = showBaseComparison && savings > 0.5;
  const savingsLabel = `Save ${product.currency_symbol ?? ''}${Math.round(savings)}`;

  /* ---- Add to cart ---- */
  const handleAdd = useCallback(async () => {
    if (!inStock || isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, variantString, quantity);
      showToast(`${product.name} added to cart`, 'success');
    } catch {
      showToast('Could not add to cart. Please try again.', 'error');
    } finally {
      setIsAdding(false);
    }
  }, [inStock, isAdding, addToCart, product.id, product.name, variantString, quantity, showToast]);

  const decrement = useCallback(() => setQuantity((q) => Math.max(1, q - 1)), []);
  const increment = useCallback(
    () => setQuantity((q) => (availableStock > 0 ? Math.min(availableStock, q + 1) : q + 1)),
    [availableStock],
  );

  /* ---------------------------------------------------------------- */
  /*  Shared sub-renders                                               */
  /* ---------------------------------------------------------------- */

  const stepper = (compact = false) => (
    <div
      className={cn(
        'flex shrink-0 items-center rounded-[var(--radius-button)] border border-neutral-300 dark:border-neutral-700',
        compact ? 'h-10' : 'h-11',
      )}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={decrement}
        disabled={quantity <= 1}
        className={cn(
          'flex h-full items-center justify-center rounded-l-[var(--radius-button)]',
          'text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30',
          'dark:text-neutral-300 dark:hover:bg-neutral-800',
          compact ? 'w-9' : 'w-11',
        )}
        aria-label="Decrease quantity"
      >
        <Minus size={15} strokeWidth={3} />
      </button>
      <span
        className={cn(
          'text-center text-sm font-bold tabular-nums text-neutral-900 dark:text-white',
          compact ? 'min-w-[28px]' : 'min-w-[36px]',
        )}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={!inStock || atCap}
        className={cn(
          'flex h-full items-center justify-center rounded-r-[var(--radius-button)]',
          'text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30',
          'dark:text-neutral-300 dark:hover:bg-neutral-800',
          compact ? 'w-9' : 'w-11',
        )}
        aria-label="Increase quantity"
      >
        <Plus size={15} strokeWidth={3} />
      </button>
    </div>
  );

  const addButton = (compact = false) => (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!inStock || isAdding}
      className={cn(
        'flex items-center justify-center gap-2 rounded-[var(--radius-button)]',
        'bg-accent font-bold uppercase tracking-wide text-white',
        'transition-colors hover:bg-accent-dark',
        'disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500',
        'dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500',
        // Compact stays shrink-0: on a 360px phone the bar already carries a
        // price block and a stepper, and a flexible button would crush them.
        compact ? 'h-10 shrink-0 px-4 text-xs' : 'h-11 flex-1 px-6 text-sm',
      )}
    >
      {isAdding ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ShoppingCart size={16} strokeWidth={2.5} />
      )}
      {inStock ? (compact ? 'Add' : 'Add to cart') : compact ? 'Sold out' : 'Out of stock'}
    </button>
  );

  /* ---------------------------------------------------------------- */

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* ---- Price ---- */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold text-neutral-900 dark:text-white">
            {displayPrice}
          </span>
          {showBaseComparison && product.has_discount && product.stroked_price && (
            <span className="text-base text-neutral-400 line-through">
              {product.stroked_price}
            </span>
          )}
          {showSavings && (
            <span className="rounded-[var(--radius-badge)] bg-accent-light px-2 py-0.5 text-xs font-bold text-accent-dark dark:bg-neutral-800 dark:text-accent">
              {savingsLabel}
            </span>
          )}
        </div>

        {/* ---- Colors (rare in grocery, but supported) ---- */}
        {colors.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Colour
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {colors.map((color, index) => (
                <button
                  key={color.code}
                  type="button"
                  onClick={() => setColorIndex(index)}
                  aria-label={`Select colour ${color.name}`}
                  aria-pressed={index === colorIndex}
                  className={cn(
                    'h-9 w-9 rounded-full border-2 transition-all',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    index === colorIndex
                      ? 'border-accent ring-2 ring-accent ring-offset-1 dark:ring-offset-neutral-950'
                      : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700',
                  )}
                  style={{ backgroundColor: color.code }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---- Pack-size / choice chips ---- */}
        {choiceOptions.map((choice) => (
          <div key={choice.name}>
            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {choice.title}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {choice.options.map((option) => {
                const isSelected = choices[choice.name] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setChoices((prev) => ({ ...prev, [choice.name]: option }))
                    }
                    aria-pressed={isSelected}
                    className={cn(
                      'rounded-[var(--radius-button)] border px-4 py-2 text-sm font-semibold transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                      isSelected
                        ? 'border-accent bg-accent-light text-accent-dark dark:bg-transparent dark:text-accent'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-transparent dark:text-neutral-300',
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ---- Low-stock nudge. A full "N available" line is noise on a
                grocery shelf; only the tail end of stock is worth saying. ---- */}
        {inStock && availableStock > 0 && availableStock <= 10 && (
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
            Only {availableStock} left
          </p>
        )}

        {/* ---- Inline actions. Hidden below lg, where the sticky bar
                takes over so the buttons are always in thumb reach. ---- */}
        <div className="hidden items-center gap-3 lg:flex">
          {stepper()}
          {addButton()}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Mobile sticky bar — pinned directly above the bottom tab bar    */}
      {/* ---------------------------------------------------------------- */}
      <div
        className={cn(
          'fixed inset-x-0 z-30 lg:hidden',
          'bottom-[calc(3.5rem+env(safe-area-inset-bottom))]',
          'border-t border-neutral-200 bg-white/95 backdrop-blur',
          'dark:border-neutral-800 dark:bg-neutral-950/95',
        )}
      >
        <div className="container mx-auto flex items-center gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold leading-tight text-neutral-900 dark:text-white">
              {displayPrice}
            </p>
            {variantString ? (
              <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {variantString.replace(/-/g, ' · ')}
              </p>
            ) : (
              product.unit && (
                <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                  {product.unit}
                </p>
              )
            )}
          </div>
          {stepper(true)}
          {addButton(true)}
        </div>
      </div>
    </>
  );
}

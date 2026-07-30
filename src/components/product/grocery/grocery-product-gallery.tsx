'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useProductVariant } from '@/components/product/product-variant-context';

/* ------------------------------------------------------------------ */
/*  Grocery Product Gallery (locked spec 2026-07-30)                   */
/*                                                                     */
/*  Single full-bleed square + dot indicators. Deliberately different  */
/*  from the shared fashion ProductGallery:                            */
/*    - No hover-zoom and no thumbnail rail. Grocery is touch-first;   */
/*      a packshot of a milk carton has nothing to zoom into, and the  */
/*      thumbnail column steals width the buy box needs on mobile.     */
/*    - object-contain, not object-cover. Cropping a packshot hides    */
/*      the label, which is the one thing the shopper is checking.     */
/*      Matches product-card-grocery.tsx.                              */
/*    - Swiping is a native scroll-snap track, so it costs no JS on    */
/*      the interaction path; the dots just mirror scroll position.    */
/*                                                                     */
/*  Still color-driven off ProductVariantProvider, same as the fashion */
/*  gallery — grocery rarely uses colors, but when a product does have */
/*  them the behaviour should not silently differ between niches.      */
/* ------------------------------------------------------------------ */

interface Photo {
  variant: string;
  color: string;
  path: string;
}

interface GroceryProductGalleryProps {
  photos: Photo[];
  productName: string;
}

export default function GroceryProductGallery({
  photos,
  productName,
}: GroceryProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const variantCtx = useProductVariant();
  const selectedColorCode = variantCtx?.selectedColorCode ?? '';

  // Show the selected color's images, falling back to the general product
  // photos (color === "") when that color has none. Size never changes these.
  const fallbackPhotos = photos.filter((p) => p.color === '');
  const colorPhotos = selectedColorCode
    ? photos.filter((p) => p.color === selectedColorCode)
    : [];
  const displayPhotos = colorPhotos.length > 0 ? colorPhotos : fallbackPhotos;

  // Jump back to the first frame whenever the color gallery swaps out.
  // Keyed on selectedColorCode rather than displayPhotos, which is a fresh
  // array identity on every render.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    setActiveIndex(0);
  }, [selectedColorCode]);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  const goTo = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }, []);

  if (displayPhotos.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[var(--radius-card)] bg-neutral-100 dark:bg-neutral-800">
        <span className="text-sm text-neutral-400 dark:text-neutral-500">
          No image available
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Full-bleed on phones (cancels the 1rem container padding),
          contained and rounded from sm up. */}
      <div className="relative -mx-4 sm:mx-0">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          tabIndex={0}
          role="region"
          aria-label={`${productName} images`}
          className={cn(
            'flex w-full snap-x snap-mandatory overflow-x-auto hide-scrollbar',
            'bg-white dark:bg-neutral-900',
            'sm:rounded-[var(--radius-card)] sm:border sm:border-neutral-200 sm:dark:border-neutral-800',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          )}
        >
          {displayPhotos.map((photo, index) => (
            <div
              key={`${photo.color}-${photo.variant}-${index}`}
              className="relative aspect-square w-full shrink-0 snap-center"
            >
              <Image
                src={photo.path}
                alt={
                  photo.variant
                    ? `${productName} — ${photo.variant}`
                    : productName
                }
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-contain p-4 sm:p-6"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Frame counter — cheap orientation on a full-bleed mobile image,
            where the dots sit below the fold of the image itself. */}
        {displayPhotos.length > 1 && (
          <span
            className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white sm:right-4"
            aria-hidden="true"
          >
            {activeIndex + 1}/{displayPhotos.length}
          </span>
        )}
      </div>

      {/* ---- Dots ---- */}
      {displayPhotos.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {displayPhotos.map((photo, index) => (
            <button
              key={`dot-${photo.color}-${photo.variant}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to image ${index + 1} of ${displayPhotos.length}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-neutral-950',
                index === activeIndex
                  ? 'w-5 bg-accent'
                  : 'w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-600',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

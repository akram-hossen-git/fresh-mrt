'use client';

import { PriceDisplay } from '@/components/product/price-display';
import { useProductVariant } from '@/components/product/product-variant-context';

interface LivePriceDisplayProps {
  mainPrice: string;
  strokedPrice: string;
  hasDiscount: boolean;
  discount: string;
  currencySymbol?: string;
}

/**
 * Wraps PriceDisplay and, when a variant is selected, overrides the shown
 * price with the live per-variant price returned by the price endpoint.
 * Falls back to the base product price when no variant price is available.
 */
export function LivePriceDisplay({
  mainPrice,
  strokedPrice,
  hasDiscount,
  discount,
  currencySymbol = '$',
}: LivePriceDisplayProps) {
  const variantCtx = useProductVariant();
  const variantPrice = variantCtx?.priceData?.price;

  // When a variant price is active, show it as the main price. The variant
  // endpoint already returns the discounted price, so we drop the strike/discount.
  if (variantPrice) {
    return (
      <PriceDisplay
        mainPrice={variantPrice}
        strokedPrice=""
        hasDiscount={false}
        discount=""
        currencySymbol={currencySymbol}
      />
    );
  }

  return (
    <PriceDisplay
      mainPrice={mainPrice}
      strokedPrice={strokedPrice}
      hasDiscount={hasDiscount}
      discount={discount}
      currencySymbol={currencySymbol}
    />
  );
}

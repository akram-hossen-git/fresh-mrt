'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export interface VariantPriceData {
  price: string;
  stock: number;
  inStock: boolean;
  image: string;
  variant: string;
}

interface VariantState {
  /** Backend-format variant string, e.g. "Red-L" — used to match gallery photos. */
  selectedVariant: string;
  setSelectedVariant: (variant: string) => void;
  /** Selected color hex code (with leading #), or '' when no colors. Drives the gallery. */
  selectedColorCode: string;
  setSelectedColorCode: (code: string) => void;
  /** Live price/stock/image for the selected variant (from the price endpoint). */
  priceData: VariantPriceData | null;
  setPriceData: (data: VariantPriceData | null) => void;
}

const ProductVariantContext = createContext<VariantState | undefined>(undefined);

export function ProductVariantProvider({ children }: { children: ReactNode }) {
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedColorCode, setSelectedColorCode] = useState('');
  const [priceData, setPriceData] = useState<VariantPriceData | null>(null);

  return (
    <ProductVariantContext.Provider
      value={{
        selectedVariant,
        setSelectedVariant,
        selectedColorCode,
        setSelectedColorCode,
        priceData,
        setPriceData,
      }}
    >
      {children}
    </ProductVariantContext.Provider>
  );
}

/** Returns the variant context, or null when used outside a provider. */
export function useProductVariant(): VariantState | null {
  return useContext(ProductVariantContext) ?? null;
}

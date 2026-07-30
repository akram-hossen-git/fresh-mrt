'use client';

import { useState, useCallback, useRef } from 'react';
import VariantSelector, { type VariantSelection } from '@/components/product/variant-selector';
import { getVariantPrice } from '@/lib/api/products';
import { useProductVariant } from '@/components/product/product-variant-context';
import { QuantitySelector } from '@/components/ui/quantity-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/context/toast-context';
import { addToWishlist } from '@/lib/api/wishlists';
import { cn } from '@/lib/utils';
import type { ProductDetail } from '@/lib/types';
import { Heart, ShoppingBag, ChevronDown, Package, Tag, Truck, Star } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  ProductAccordion – reusable collapsible sections (client component)       */
/* -------------------------------------------------------------------------- */

export interface AccordionSection {
  title: string;
  content?: string;
  isHtml?: boolean;
  items?: { label: string; value: string }[];
  /**
   * Arbitrary rendered content. Takes precedence over `content`/`items`.
   * Lets a Server Component pass in a whole panel (e.g. ProductReviews) or a
   * row that needs a link rather than a plain string value. Used by the
   * grocery detail page, where Reviews and the demoted shop link live inside
   * accordions rather than as standalone sections.
   */
  node?: React.ReactNode;
  /** Render expanded on first paint. Grocery opens "About this item" by default. */
  defaultOpen?: boolean;
}

const sectionIcons: Record<string, React.ReactNode> = {
  Description: <Package size={18} className="shrink-0 text-neutral-500 dark:text-neutral-400" />,
  'About this item': <Package size={18} className="shrink-0 text-neutral-500 dark:text-neutral-400" />,
  'Additional Information': <Tag size={18} className="shrink-0 text-neutral-500 dark:text-neutral-400" />,
  'Shipping & Returns': <Truck size={18} className="shrink-0 text-neutral-500 dark:text-neutral-400" />,
  Reviews: <Star size={18} className="shrink-0 text-neutral-500 dark:text-neutral-400" />,
};

function AccordionItem({ section }: { section: AccordionSection }) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between gap-3 py-4 text-left',
          'text-sm font-medium text-neutral-900 dark:text-neutral-100',
          'transition-all duration-300 hover:text-accent dark:hover:text-accent'
        )}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2.5">
          {sectionIcons[section.title] ?? null}
          {section.title}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-neutral-400 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-all duration-300',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4 pl-7 pr-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {section.node ? (
              section.node
            ) : section.isHtml && section.content ? (
              <div
                className="prose prose-sm prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            ) : section.items && section.items.length > 0 ? (
              <dl className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-baseline gap-2">
                    <dt className="font-medium text-neutral-700 dark:text-neutral-300 min-w-[80px]">
                      {item.label}:
                    </dt>
                    <dd className="text-neutral-600 dark:text-neutral-400">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>{section.content}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductAccordion({ sections }: { sections: AccordionSection[] }) {
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700">
      {sections.map((section) => (
        <AccordionItem key={section.title} section={section} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AddToCartSection – interactive product actions                            */
/* -------------------------------------------------------------------------- */

interface AddToCartSectionProps {
  product: ProductDetail;
  slug: string;
}

export function AddToCartSection({ product, slug }: AddToCartSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const variantCtx = useProductVariant();

  // Live price/stock from the variant endpoint; falls back to base product values.
  const [livePrice, setLivePrice] = useState<{ price: string; inStock: boolean; stock: number } | null>(null);
  // Guards against out-of-order responses when the user clicks variants quickly.
  const requestSeq = useRef(0);

  const inStock = livePrice ? livePrice.inStock : product.current_stock > 0;
  const availableStock = livePrice ? livePrice.stock : product.current_stock;
  const hasVariants = product.colors.length > 0 || product.choice_options.length > 0;

  const handleVariantChange = useCallback(
    (selection: VariantSelection) => {
      setSelectedVariant(selection.variantString);

      // 1) Instant image swap from already-loaded photos (no network).
      if (variantCtx) {
        variantCtx.setSelectedVariant(selection.variantString);
        variantCtx.setSelectedColorCode(selection.colorCode);
      }

      // 2) Authoritative price/stock/image from the endpoint.
      const seq = ++requestSeq.current;
      getVariantPrice({
        id: product.id,
        slug,
        color: selection.colorCode ? selection.colorCode.replace('#', '') : '',
        variants: selection.choiceValues.join(','),
        quantity: 1,
      })
        .then((res) => {
          if (seq !== requestSeq.current) return; // stale response
          if (res.result && res.data) {
            setLivePrice({
              price: res.data.price,
              inStock: res.data.in_stock === 1,
              stock: res.data.stock,
            });
            if (variantCtx) {
              variantCtx.setPriceData({
                price: res.data.price,
                stock: res.data.stock,
                inStock: res.data.in_stock === 1,
                image: res.data.image,
                variant: res.data.variant,
              });
            }
          }
        })
        .catch(() => {
          // Keep base values on failure; image already swapped from local photos.
        });
    },
    [product.id, slug, variantCtx]
  );

  const handleAddToCart = async () => {
    if (!inStock) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariant, quantity);
      showToast('Product added to cart successfully!', 'success');
    } catch {
      showToast('Failed to add product to cart. Please try again.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true);
    try {
      await addToWishlist(slug);
      showToast('Product added to your wishlist!', 'success');
    } catch {
      showToast('Failed to add to wishlist. Please try again.', 'error');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Variant Selector */}
      {hasVariants && (
        <VariantSelector
          colors={product.colors}
          choiceOptions={product.choice_options}
          onVariantChange={handleVariantChange}
        />
      )}

      {/* Stock Status Badge */}
      <div className="flex items-center gap-3">
        {inStock ? (
          <Badge variant="success" size="md">
            In Stock
          </Badge>
        ) : (
          <Badge variant="danger" size="md">
            Out of Stock
          </Badge>
        )}
        {inStock && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {availableStock} {product.unit} available
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Quantity
        </label>
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={setQuantity}
          min={1}
          max={inStock ? availableStock : 1}
        />
      </div>

      {/* Add to Cart Button */}
      <Button
        variant="accent"
        size="lg"
        fullWidth
        disabled={!inStock}
        isLoading={isAddingToCart}
        onClick={handleAddToCart}
        icon={<ShoppingBag size={18} />}
      >
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </Button>

      {/* Add to Wishlist Button */}
      <Button
        variant="outline"
        size="md"
        fullWidth
        isLoading={isAddingToWishlist}
        onClick={handleAddToWishlist}
        icon={<Heart size={18} />}
      >
        Add to Wishlist
      </Button>
    </div>
  );
}

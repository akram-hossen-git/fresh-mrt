import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSquare } from '@/components/product/product-card-square';
import { ProductCardCompact } from '@/components/product/product-card-compact';
import { ProductCardGrocery } from '@/components/product/grocery/product-card-grocery';
import { storeConfig } from '@/config/store.config';
import type { ProductMini } from '@/lib/types';
import type { ProductCardVariant } from '@/config/store.types';

interface ProductGridProps {
  products: ProductMini[];
  columns?: 2 | 3 | 4 | 5;
  isLoading?: boolean;
  className?: string;
  /** Override the store config card variant for this specific grid */
  cardVariant?: ProductCardVariant;
}

const columnClasses: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

function ProductCardSkeleton({ variant }: { variant: ProductCardVariant }) {
  if (variant === 'compact') {
    return (
      <div className="animate-pulse flex gap-4 rounded-[var(--radius-card)] border border-neutral-200 dark:border-neutral-800 p-3">
        <div className="h-24 w-24 shrink-0 rounded-[var(--radius-button)] bg-neutral-200 dark:bg-neutral-800" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800 mt-auto" />
        </div>
      </div>
    );
  }

  const aspectClass =
    variant === 'square' || variant === 'grocery'
      ? 'aspect-square'
      : 'aspect-[3/4]';

  // Grocery skeletons live inside a bordered card, like the real thing
  if (variant === 'grocery') {
    return (
      <div className="animate-pulse rounded-[var(--radius-card)] border border-neutral-200 p-2.5 dark:border-neutral-800">
        <div className="mb-2 aspect-square rounded-[var(--radius-button)] bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-2">
          <div className="h-2.5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-3.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex items-center justify-between pt-1">
            <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-8 w-14 rounded-[var(--radius-button)] bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className={cn(aspectClass, 'rounded-[var(--radius-card)] bg-neutral-200 dark:bg-neutral-800 mb-3')} />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

function CardByVariant({ product, variant }: { product: ProductMini; variant: ProductCardVariant }) {
  switch (variant) {
    case 'grocery':
      return <ProductCardGrocery product={product} />;
    case 'square':
      return <ProductCardSquare product={product} />;
    case 'compact':
      return <ProductCardCompact product={product} />;
    case 'tall':
    default:
      return <ProductCard product={product} />;
  }
}

export function ProductGrid({
  products,
  columns = 4,
  isLoading = false,
  className,
  cardVariant,
}: ProductGridProps) {
  const variant = cardVariant ?? storeConfig.productCard;
  const gridCols = columnClasses[columns] ?? columnClasses[4];

  // Compact variant uses a single-column list layout
  const isCompact = variant === 'compact';
  // Grocery grids are denser — gap-6 leaves too much dead space between cards,
  // and equal row heights matter because the ADD button is bottom-aligned.
  const gridClass = isCompact
    ? 'flex flex-col gap-3'
    : variant === 'grocery'
      ? cn('grid grid-cols-2 gap-3 sm:gap-4 items-stretch', gridCols)
      : cn('grid grid-cols-2 gap-6', gridCols);

  if (isLoading) {
    return (
      <div className={cn(gridClass, className)}>
        {Array.from({ length: isCompact ? 6 : columns * 2 }, (_, i) => (
          <ProductCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(gridClass, className)}>
      {products.map((product, index) => (
        <div
          key={product.id}
          className={cn('animate-fade-in', variant === 'grocery' && 'h-full')}
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
          <CardByVariant product={product} variant={variant} />
        </div>
      ))}
    </div>
  );
}

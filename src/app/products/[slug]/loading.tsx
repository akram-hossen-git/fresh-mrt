import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image area */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 w-20 shrink-0 rounded-[8px] bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
        </div>

        {/* Sidebar details */}
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-4 w-4 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-4 w-24 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Title */}
          <Skeleton className="h-9 w-3/4 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-5 w-16 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Price */}
          <Skeleton className="h-8 w-32 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />

          {/* Description lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-4 w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-4 w-5/6 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-4 w-2/3 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Variant selectors */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-20 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 w-16 rounded-[8px] bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-12 w-28 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-12 flex-1 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Secondary action */}
          <Skeleton className="h-12 w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

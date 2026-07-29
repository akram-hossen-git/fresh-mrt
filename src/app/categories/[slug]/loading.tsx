import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category banner */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-48 w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
        <Skeleton className="h-8 w-64 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
        <Skeleton className="h-4 w-96 max-w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="space-y-6">
            {/* Filter group 1 */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-24 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                  <Skeleton className="h-4 w-20 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                </div>
              ))}
            </div>

            {/* Filter group 2 */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-20 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                  <Skeleton className="h-4 w-24 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                </div>
              ))}
            </div>

            {/* Filter group 3 */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-16 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
              <Skeleton className="h-8 w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </aside>

        {/* Product card grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-10 w-40 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-4 w-3/4 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-4 w-1/2 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                  <Skeleton className="h-8 w-24 rounded-[8px] bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

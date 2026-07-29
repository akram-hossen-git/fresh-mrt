import { Skeleton, ProductCardSkeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <div className="animate-fade-in">
      {/* Hero skeleton */}
      <Skeleton className="w-full h-[60vh] md:h-[80vh] rounded-none" />

      {/* Category bar skeleton */}
      <div className="container mx-auto mt-8 md:mt-12">
        <div className="flex gap-6 overflow-hidden py-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <Skeleton className="w-16 h-16 md:w-20 md:h-20" rounded />
              <Skeleton width={60} height={12} />
            </div>
          ))}
        </div>
      </div>

      {/* Section header skeleton */}
      <div className="container mx-auto mt-10 md:mt-14 flex flex-col items-center gap-3">
        <Skeleton width={200} height={32} />
        <Skeleton width={320} height={16} />
      </div>

      {/* Product grid skeleton */}
      <div className="container mx-auto mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="container mx-auto mt-12 md:mt-16 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="w-full aspect-[16/9]" />
          <Skeleton className="w-full aspect-[16/9]" />
        </div>
      </div>

      {/* Second product section skeleton */}
      <div className="container mx-auto mt-10 md:mt-14 flex flex-col items-center gap-3">
        <Skeleton width={180} height={32} />
        <Skeleton width={300} height={16} />
      </div>

      <div className="container mx-auto mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

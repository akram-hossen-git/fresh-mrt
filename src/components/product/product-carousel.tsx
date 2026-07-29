'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import type { ProductMini } from '@/lib/types';

import 'swiper/css';
import 'swiper/css/free-mode';

interface ProductCarouselProps {
  products: ProductMini[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative overflow-hidden">
      {/* Nav buttons — hidden on mobile, shown md+ */}
      <button
        ref={prevRef}
        className="hidden md:flex absolute -left-5 top-1/3 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-accent hover:text-accent transition-colors shadow-sm"
        aria-label="Previous"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
      </button>
      <button
        ref={nextRef}
        className="hidden md:flex absolute -right-5 top-1/3 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-accent hover:text-accent transition-colors shadow-sm"
        aria-label="Next"
      >
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>

      <Swiper
        modules={[Navigation, FreeMode]}
        freeMode={{ enabled: true, sticky: false }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        slidesPerView={2}
        spaceBetween={12}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

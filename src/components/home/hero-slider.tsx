'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import type { Slider } from '@/lib/types';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface HeroSliderProps {
  sliders: Slider[];
}

const slideContent = [
  { eyebrow: 'New Season', heading: 'DRESS\nBOLD.\nLIVE\nLOUD.', cta: 'Shop Now' },
  { eyebrow: 'Best Sellers', heading: 'YOUR\nSTYLE.\nYOUR\nRULES.', cta: 'Shop Now' },
  { eyebrow: 'Limited Drops', heading: 'FRESH\nFITS.\nEVERY\nWEEK.', cta: 'Shop Now' },
];

export function HeroSlider({ sliders }: HeroSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (!sliders.length) return null;

  return (
    <section className="relative w-full hero-height overflow-hidden bg-black">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: '.hero-pagination' }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiper) => {
          if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
        loop={sliders.length > 1}
        speed={600}
        className="w-full h-full"
      >
        {sliders.map((slider, index) => {
          const content = slideContent[index % slideContent.length];
          const lines = content.heading.split('\n');
          return (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <Image
                  src={slider.photo}
                  alt={lines[0]}
                  fill
                  className="object-cover object-top"
                  priority={index === 0}
                  sizes="100vw"
                />
                {/* Strong bottom gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Bottom-anchored content */}
                <div className="absolute inset-x-0 bottom-0 pb-16 md:pb-20 container mx-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent mb-3 font-display">
                    {content.eyebrow}
                  </p>
                  <h1 className="hero-headline font-display font-black uppercase leading-[0.88] text-white mb-6 whitespace-pre-line">
                    {content.heading}
                  </h1>
                  <Link
                    href={slider.url || '/new-arrivals'}
                    className="inline-flex items-center gap-3 bg-accent text-white text-xs font-bold uppercase tracking-widest px-7 py-3.5 hover:bg-white hover:text-black transition-colors duration-200"
                  >
                    {content.cta}
                    <span className="text-base leading-none">→</span>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Pagination dots — bottom right */}
      <div className="hero-pagination absolute bottom-6 right-4 md:right-8 z-10 flex gap-2" />

      {/* Nav arrows — desktop only */}
      <button
        ref={prevRef}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-11 h-11 border border-white/30 text-white hover:bg-white hover:text-black transition-colors duration-200"
        aria-label="Previous slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        ref={nextRef}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-11 h-11 border border-white/30 text-white hover:bg-white hover:text-black transition-colors duration-200"
        aria-label="Next slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <style jsx global>{`
        .hero-height { height: 85svh; min-height: 480px; }
        @media (min-width: 768px) { .hero-height { height: 100svh; } }
        .hero-headline { font-size: clamp(3.5rem, 14vw, 10rem); }
        .hero-pagination { position: absolute !important; bottom: 24px !important; right: 1rem !important; left: auto !important; width: auto !important; display: flex !important; gap: 6px !important; }
        .hero-pagination .swiper-pagination-bullet { width: 6px !important; height: 6px !important; background: rgba(255,255,255,0.4) !important; opacity: 1 !important; border-radius: 0 !important; margin: 0 !important; transition: all 0.3s !important; }
        .hero-pagination .swiper-pagination-bullet-active { background: #FF3D00 !important; width: 20px !important; }
      `}</style>
    </section>
  );
}

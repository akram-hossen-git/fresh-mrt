'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, timeLeft } from '@/lib/utils';
import type { FlashDeal } from '@/lib/types';

interface FlashDealBannerProps {
  flashDeals: FlashDeal[];
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
        <span
          key={value}
          className="text-2xl md:text-3xl font-bold text-white tabular-nums animate-flip-in"
        >
          {display}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-wider text-white/60 font-medium">
        {label}
      </span>
    </div>
  );
}

export function FlashDealBanner({ flashDeals }: FlashDealBannerProps) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  // Find first active deal
  const activeDeal = flashDeals.find((d) => {
    const remaining = timeLeft(d.date);
    return (
      remaining.days > 0 ||
      remaining.hours > 0 ||
      remaining.minutes > 0 ||
      remaining.seconds > 0
    );
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeDeal) return;

    const update = () => setTime(timeLeft(activeDeal.date));
    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeDeal]);

  if (!activeDeal) return null;

  const products = activeDeal.products?.data ?? [];

  return (
    <section className="bg-neutral-900 dark:bg-black overflow-hidden">
      <div className="container mx-auto py-12 md:py-16">
        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: banner image */}
          {activeDeal.banner && (
            <div className="relative aspect-[4/3] lg:aspect-[3/2] rounded-xl overflow-hidden">
              <Image
                src={activeDeal.banner}
                alt={activeDeal.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}

          {/* Right: content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 rounded-full">
              Flash Deal
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-6">
              {activeDeal.title}
            </h2>

            {/* Countdown */}
            {mounted && (
              <div className="flex items-center gap-3 md:gap-4 mb-8">
                <CountdownDigit value={time.days} label="Days" />
                <span className="text-2xl font-bold text-white/40 -mt-5">:</span>
                <CountdownDigit value={time.hours} label="Hrs" />
                <span className="text-2xl font-bold text-white/40 -mt-5">:</span>
                <CountdownDigit value={time.minutes} label="Min" />
                <span className="text-2xl font-bold text-white/40 -mt-5">:</span>
                <CountdownDigit value={time.seconds} label="Sec" />
              </div>
            )}

            <Link
              href={`/flash-deals/${activeDeal.slug}`}
              className="inline-block px-8 py-3.5 text-sm font-medium tracking-wider uppercase bg-white text-black hover:bg-accent hover:text-white transition-colors duration-300"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Products horizontal scroll */}
        {products.length > 0 && (
          <div className="mt-10 pt-10 border-t border-white/10">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="shrink-0 snap-start w-36 md:w-44 group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800 mb-2">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="176px"
                    />
                  </div>
                  <p className="text-xs text-white/80 truncate group-hover:text-white transition-colors">
                    {product.name}
                  </p>
                  <p className="text-sm font-semibold text-accent mt-0.5">
                    {product.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Countdown flip animation */}
      <style jsx global>{`
        @keyframes flip-in {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-flip-in {
          animation: flip-in 0.4s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

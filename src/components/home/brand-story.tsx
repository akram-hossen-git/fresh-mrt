import Link from 'next/link';
import { cn } from '@/lib/utils';
import { storeConfig } from '@/config/store.config';

export function BrandStory() {
  return (
    <section className="bg-surface-light dark:bg-surface-dark">
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: image placeholder */}
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-3xl text-neutral-400 dark:text-neutral-500 tracking-wider">
                {storeConfig.content.name}
              </span>
            </div>
          </div>

          {/* Right: text content */}
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Since 2015
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white leading-tight">
              Our Story
            </h2>
            <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <p>
                Born from a passion for timeless design and exceptional quality,
                {storeConfig.content.name} was founded with a singular vision: to create a destination
                where modern fashion meets enduring craftsmanship.
              </p>
              <p>
                Every piece in our collection is thoughtfully curated, blending
                contemporary aesthetics with sustainable practices. We partner
                with artisans worldwide who share our commitment to excellence
                and ethical production.
              </p>
              <p>
                From the finest fabrics to meticulous tailoring, each garment
                tells a story of dedication — designed to become a treasured
                part of your wardrobe for years to come.
              </p>
            </div>
            <Link
              href="/about"
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium',
                'text-neutral-900 dark:text-white hover:text-accent dark:hover:text-accent',
                'transition-colors group',
              )}
            >
              Read More
              <span className="inline-block transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

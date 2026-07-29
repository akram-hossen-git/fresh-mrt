import Link from 'next/link';
import Image from 'next/image';
import type { Banner } from '@/lib/types';

const splitLabels = ['New In', 'Trending Now', 'Just Dropped', 'Staff Picks'];
const storyLabels = ['Street Style', 'Essentials', 'Going Out', 'Workwear', 'Casual', 'Premium'];
const cinematicLabel = { eyebrow: 'This Season', headline: 'THE\nCOLLECTION\nIS HERE.', cta: 'Shop All' };

interface BannerGridProps {
  bannersOne: Banner[];
  bannersTwo: Banner[];
  bannersThree: Banner[];
}

/* ── Zone A: Split Hero (bannersOne) ─────────────────────────────── */
function SplitHero({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  // Single image → full-width portrait
  if (banners.length === 1) {
    return (
      <Link href={banners[0].url || '#'} className="relative block w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden group">
        <Image src={banners[0].photo} alt={splitLabels[0]} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
          <p className="font-display font-black uppercase text-white text-2xl md:text-5xl leading-none tracking-tight">
            {splitLabels[0]}
          </p>
        </div>
      </Link>
    );
  }

  // 2+ images → side-by-side split
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
      {banners.slice(0, 2).map((banner, i) => (
        <Link key={i} href={banner.url || '#'} className="relative block aspect-[3/4] sm:aspect-[4/5] overflow-hidden group">
          <Image src={banner.photo} alt={splitLabels[i] ?? splitLabels[0]} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
          {/* Dark gradient bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent mb-1 font-display">
              {i === 0 ? 'New Arrivals' : 'Best Sellers'}
            </p>
            <p className="font-display font-black uppercase text-white text-xl md:text-3xl leading-none tracking-tight">
              {splitLabels[i] ?? splitLabels[0]}
            </p>
            <span className="inline-flex items-center gap-2 mt-3 text-[11px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
              Shop Now <span className="text-accent">→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ── Zone B: Story Strip (bannersTwo) ────────────────────────────── */
function StoryStrip({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;

  return (
    <div className="relative">
      {/* Fade hint on right edge — mobile only */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent z-10 pointer-events-none sm:hidden" />
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible snap-x snap-mandatory md:snap-none scrollbar-hide">
        {banners.map((banner, i) => (
          <Link
            key={i}
            href={banner.url || '#'}
            className="shrink-0 snap-start w-[42vw] sm:w-[30vw] md:w-auto relative aspect-[9/14] overflow-hidden group block"
          >
            <Image src={banner.photo} alt={storyLabels[i % storyLabels.length]} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 42vw, (max-width: 768px) 30vw, 25vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
              <p className="font-display font-black uppercase text-white text-sm md:text-base leading-tight tracking-tight">
                {storyLabels[i % storyLabels.length]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Zone C: Cinematic Banner (bannersThree) ─────────────────────── */
function CinematicBanner({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) return null;
  const banner = banners[0];

  return (
    <Link href={banner.url || '#'} className="relative block w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden group">
      <Image src={banner.photo} alt={cinematicLabel.headline} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="100vw" />
      {/* Strong left-side gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="p-6 md:p-16 max-w-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3 font-display">
            {cinematicLabel.eyebrow}
          </p>
          <h3 className="font-display font-black uppercase text-white leading-[0.88] tracking-tight whitespace-pre-line" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
            {cinematicLabel.headline}
          </h3>
          <span className="inline-flex items-center gap-3 mt-6 bg-accent text-white text-[11px] font-bold uppercase tracking-widest px-6 py-3 group-hover:bg-white group-hover:text-black transition-colors duration-200">
            {cinematicLabel.cta} <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Main export ─────────────────────────────────────────────────── */
export function BannerGrid({ bannersOne, bannersTwo, bannersThree }: BannerGridProps) {
  const hasAny = bannersOne.length > 0 || bannersTwo.length > 0 || bannersThree.length > 0;
  if (!hasAny) return null;

  return (
    <section className="container mx-auto space-y-2 md:space-y-3">
      {/* Section label */}
      <div className="flex items-stretch gap-4 pb-4 md:pb-6">
        <div className="w-1 bg-accent rounded-full" />
        <h2 className="font-display text-2xl md:text-4xl font-black uppercase text-neutral-900 dark:text-white tracking-tight">
          Shop by Style
        </h2>
      </div>

      <SplitHero banners={bannersOne} />
      <StoryStrip banners={bannersTwo} />
      <CinematicBanner banners={bannersThree} />
    </section>
  );
}

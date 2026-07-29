import { Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storeConfig } from '@/config/store.config';

const placeholderItems = [
  { text: 'Street Style', gradient: 'from-rose-400 to-pink-600' },
  { text: 'Minimalist', gradient: 'from-amber-400 to-orange-600' },
  { text: 'Evening Wear', gradient: 'from-violet-400 to-purple-600' },
  { text: 'Accessories', gradient: 'from-cyan-400 to-blue-600' },
  { text: 'Casual Chic', gradient: 'from-emerald-400 to-teal-600' },
  { text: 'New Season', gradient: 'from-fuchsia-400 to-pink-600' },
];

export function InstagramGrid() {
  return (
    <section className="container mx-auto py-12 md:py-16">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
          Follow Us on Instagram
        </h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm">
          @{storeConfig.content.name}.official
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {placeholderItems.map((item, index) => (
          <a
            key={index}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
          >
            {/* Gradient placeholder */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br',
                item.gradient,
              )}
            />

            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/60 text-xs font-medium tracking-wider">
                {item.text}
              </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
              <Instagram
                size={24}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

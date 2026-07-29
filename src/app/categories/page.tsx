import Link from 'next/link';
import Image from 'next/image';
import { getCategoryMenu } from '@/lib/api/categories';
import { storeConfig } from '@/config/store.config';
import { cn } from '@/lib/utils';
import type { MenuCategory } from '@/lib/types/category';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Categories | ${storeConfig.content.name}`,
  description: `Browse all product categories at ${storeConfig.content.name}.`,
};

const TINTS = [
  'from-accent/20 to-accent/5',
  'from-amber-200/50 to-amber-50',
  'from-sky-200/50 to-sky-50',
  'from-rose-200/50 to-rose-50',
  'from-violet-200/50 to-violet-50',
  'from-emerald-200/50 to-emerald-50',
];

function tileTint(seed: number): string {
  return TINTS[seed % TINTS.length];
}

export default async function CategoriesPage() {
  let categories: MenuCategory[] = [];

  try {
    const res = await getCategoryMenu();
    categories = res.data || [];
  } catch {
    // fallback
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <section className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto py-8 md:py-10">
          <div className="flex items-stretch gap-4">
            <div className="w-1 bg-accent rounded-full" />
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-none text-neutral-900 dark:text-white tracking-tight">
              Categories
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto py-8 pb-16">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              No categories available at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => {
              const subs = category.children ?? [];
              if (subs.length === 0) return null;

              return (
                <section key={category.id}>
                  {/* Section header */}
                  <div className="mb-6">
                    <h2 className="font-display text-xl font-bold text-neutral-900 dark:text-white">
                      {category.name}
                    </h2>
                    <hr className="mt-2 border-neutral-200 dark:border-neutral-700" />
                  </div>

                  {/* Subcategory tile grid */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {subs.map((sub, i) => {
                      const image = sub.icon || null;

                      return (
                        <Link
                          key={sub.id}
                          href={`/categories/${sub.slug}`}
                          className="group flex flex-col items-center gap-2"
                        >
                          <div
                            className={cn(
                              'relative aspect-square w-full overflow-hidden',
                              'rounded-[var(--radius-card)] bg-gradient-to-br',
                              !image && tileTint(i),
                              image && 'bg-neutral-50 dark:bg-neutral-900',
                            )}
                          >
                            {image ? (
                              <Image
                                src={image}
                                alt=""
                                fill
                                className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold uppercase tracking-wide text-accent-dark">
                                {sub.name.slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <span className="text-center text-xs font-medium leading-tight text-neutral-700 dark:text-neutral-300 group-hover:text-accent line-clamp-2">
                            {sub.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

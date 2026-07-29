import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getCategoryMenu } from '@/lib/api/categories';
import { SectionHeader } from '@/components/home/section-header';
import { GroceryCategoryBrowser } from '@/components/category/grocery/grocery-category-browser';
import { storeConfig } from '@/config/store.config';
import type { MenuCategory } from '@/lib/types/category';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Categories | ${storeConfig.content.name}`,
  description: `Browse all product categories at ${storeConfig.content.name}.`,
};

/* ------------------------------------------------------------------ */
/*  Grocery: two-pane browser (locked wireframe 2026-07-28).           */
/*  The menu tree is fetched on the server so the page is crawlable    */
/*  and paints without a loading flash; only the pane swapping is      */
/*  client-side.                                                       */
/* ------------------------------------------------------------------ */
async function GroceryCategoriesView() {
  let categories: MenuCategory[] = [];

  try {
    const res = await getCategoryMenu();
    categories = res.data || [];
  } catch {
    // fallback to empty — the browser renders its own empty state
  }

  return (
    <div className="container mx-auto">
      <h1 className="px-1 py-4 text-lg font-bold text-neutral-900 dark:text-white">
        Shop by Category
      </h1>
      <GroceryCategoryBrowser categories={categories} />
    </div>
  );
}

export default async function CategoriesPage() {
  if (storeConfig.headerStyle === 'grocery') {
    return <GroceryCategoriesView />;
  }

  return <FashionCategoriesView />;
}

async function FashionCategoriesView() {
  let categories: { id: number; slug: string; name: string; banner: string; cover_image: string; icon: string; number_of_children: number }[] = [];

  try {
    const res = await getCategories();
    categories = res.data || [];
  } catch {
    // fallback to empty
  }

  return (
    <div className="container mx-auto py-12">
      <SectionHeader
        title="Shop by Category"
        subtitle="Explore our curated collections"
      />

      {categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            No categories available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative aspect-[4/3] rounded-card overflow-hidden bg-neutral-100 dark:bg-neutral-800"
            >
              {category.banner ? (
                <Image
                  src={category.banner}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : category.icon ? (
                <Image
                  src={category.icon}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/80" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                <h3 className="font-display text-xl font-semibold text-white text-center">
                  {category.name}
                </h3>
                {category.number_of_children > 0 && (
                  <p className="text-white/70 text-sm mt-1">
                    {category.number_of_children} subcategories
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

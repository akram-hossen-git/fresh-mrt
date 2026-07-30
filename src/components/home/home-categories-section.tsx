import { getHomeCategories } from '@/lib/api/categories';
import HomeCategoriesClient from '@/components/home/home-categories-client';

export default async function HomeCategoriesSection() {
  const homeRes = await getHomeCategories();
  const categories = homeRes?.data ?? [];

  if (!categories || categories.length === 0) return null;

  return (
    <div>
      {categories.map((category: any) => (
        <section key={category.id} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{category.name}</h2>
          </div>
          <HomeCategoriesClient slug={category.slug} viewAllHref={`/categories/${category.slug}`} />
        </section>
      ))}
    </div>
  );
}

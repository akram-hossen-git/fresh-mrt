import type { Metadata } from 'next';
import { getCategoryInfo, getCategoryMenu } from '@/lib/api/categories';
import { getCategoryProducts } from '@/lib/api/products';
import { storeConfig } from '@/config/store.config';
import { CategoryBrowseView } from './category-browse-view';
import type { MenuCategory } from '@/lib/types/category';
import type { ProductMini } from '@/lib/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort_key?: string;
  }>;
}

function findFirstChildSlug(menuTree: MenuCategory[], slug: string): string | null {
  for (const cat of menuTree) {
    if (cat.slug === slug) return cat.children?.[0]?.slug ?? null;
    for (const sub of cat.children ?? []) {
      if (sub.slug === slug) return sub.children?.[0]?.slug ?? null;
    }
  }
  return null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryInfo(slug);
  const category = Array.isArray(result.data) ? result.data[0] : result.data;

  return {
    title: category?.name ? `${category.name} | ${storeConfig.content.name}` : `Category | ${storeConfig.content.name}`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const sortKey = resolvedSearchParams.sort_key;

  const [categoryResult, menuResult] = await Promise.all([
    getCategoryInfo(slug),
    getCategoryMenu().catch(() => ({ data: [] as MenuCategory[] })),
  ]);

  const category = Array.isArray(categoryResult.data) ? categoryResult.data[0] : categoryResult.data;
  const menuTree = menuResult.data ?? [];

  const firstChildSlug = findFirstChildSlug(menuTree, slug);
  const productSlug = firstChildSlug ?? slug;

  const productsResult = await getCategoryProducts(
    productSlug,
    currentPage,
    sortKey ? { sort_key: sortKey } : undefined,
  );

  const products = (productsResult.data ?? []) as ProductMini[];
  const totalPages = productsResult.meta?.last_page ?? 1;
  const totalProducts = productsResult.meta?.total ?? products.length;

  return (
    <CategoryBrowseView
      initialSlug={slug}
      initialCategory={category}
      initialProducts={products}
      initialTotalPages={totalPages}
      initialTotalProducts={totalProducts}
      initialPage={currentPage}
      menuTree={menuTree}
    />
  );
}

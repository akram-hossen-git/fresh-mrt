import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Category, HomeCategory } from '@/lib/types';

interface CategoryCardProps {
  category: Category | HomeCategory;
  className?: string;
}

function getCategoryHref(category: Category | HomeCategory): string {
  if ('slug' in category) return `/categories/${category.slug}`;
  // For HomeCategory, derive a slug from the name
  const slug = category.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `/categories/${slug}`;
}

function getCategoryImage(category: Category | HomeCategory): string | null {
  if ('banner' in category && category.banner) return category.banner;
  if ('cover_image' in category && category.cover_image) return category.cover_image;
  if ('icon' in category && category.icon) return category.icon;
  return null;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const href = getCategoryHref(category);
  const image = getCategoryImage(category);

  return (
    <Link
      href={href}
      className={cn(
        'relative block aspect-square rounded-xl overflow-hidden group',
        className,
      )}
    >
      {/* Background */}
      {image ? (
        <Image
          src={image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 to-neutral-500 dark:from-neutral-700 dark:to-neutral-900" />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-colors duration-300 group-hover:from-black/80" />

      {/* Category name */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-center">
        <h3 className="font-display text-lg md:text-xl font-semibold text-white text-center">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}

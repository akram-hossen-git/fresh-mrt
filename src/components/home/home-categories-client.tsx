'use client';

import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api-client';
import { ProductCarousel } from '@/components/product/product-carousel';
import type { ProductMini } from '@/lib/types';

interface Props {
  slug: string;
  viewAllHref?: string;
}

export default function HomeCategoriesClient({ slug, viewAllHref }: Props) {
  const [products, setProducts] = useState<ProductMini[] | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let observed = false;
    const node = ref.current;

    const fetchProducts = () => {
      if (!mounted) return;
      setLoading(true);
      apiFetch(`/products/category/${encodeURIComponent(slug)}?page=1`).then((res: any) => {
        if (!mounted) return;
        setProducts(res.data ?? []);
        setLoading(false);
      }).catch(() => {
        if (!mounted) return;
        setProducts([]);
        setLoading(false);
      });
    };

    if (node && typeof IntersectionObserver !== 'undefined') {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !observed) {
            observed = true;
            fetchProducts();
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px' });
      obs.observe(node);
      return () => { mounted = false; obs.disconnect(); };
    }

    // Fallback: fetch immediately
    fetchProducts();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div ref={ref} className="space-y-3">
        <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div ref={ref}>
      <ProductCarousel products={products} />
      {viewAllHref && (
        <div className="mt-2 text-right">
          <a href={viewAllHref} className="text-sm text-accent">View all</a>
        </div>
      )}
    </div>
  );
}

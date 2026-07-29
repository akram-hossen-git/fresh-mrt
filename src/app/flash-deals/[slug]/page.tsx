import { getFlashDealInfo } from '@/lib/api/home';
import { SectionHeader } from '@/components/home/section-header';
import { ProductGrid } from '@/components/product/product-grid';
import { FlashDealBanner } from '@/components/home/flash-deal-banner';
import { storeConfig } from '@/config/store.config';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await getFlashDealInfo(slug);
    const deal = Array.isArray(res.data) ? res.data[0] : res.data;
    return { title: `${deal?.title || 'Flash Deal'} | ${storeConfig.content.name}` };
  } catch {
    return { title: `Flash Deal | ${storeConfig.content.name}` };
  }
}

export default async function FlashDealDetailPage({ params }: Props) {
  const { slug } = await params;

  let flashDeal: any = null;

  try {
    const res = await getFlashDealInfo(slug);
    flashDeal = Array.isArray(res.data) ? res.data[0] : res.data;
  } catch {
    // handle error
  }

  if (!flashDeal) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="font-display text-3xl font-bold mb-4">Deal Not Found</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          This flash deal may have expired or doesn&apos;t exist.
        </p>
        <Link
          href="/flash-deals"
          className="inline-block px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-btn font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
        >
          View All Deals
        </Link>
      </div>
    );
  }

  const products = flashDeal.products?.data || [];

  return (
    <div className="py-12">
      <div className="container mx-auto">
        <SectionHeader title={flashDeal.title} />

        <div className="mt-10">
          <FlashDealBanner flashDeals={[flashDeal]} />
        </div>

        {products.length > 0 && (
          <div className="mt-16">
            <SectionHeader title="Deal Products" />
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block rounded-card overflow-hidden bg-white dark:bg-neutral-900 shadow-subtle hover:shadow-card transition-shadow"
                >
                  <div className="aspect-[3/4] relative bg-neutral-100 dark:bg-neutral-800">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                    <p className="text-sm font-semibold mt-1">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

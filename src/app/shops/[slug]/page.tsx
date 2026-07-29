import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ShoppingBag,
  Package,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import {
  getShopDetails,
  getShopAllProducts,
  getShopTopProducts,
  getShopNewProducts,
  getShopFeaturedProducts,
} from '@/lib/api/shops';
import { RatingStars } from '@/components/ui/rating-stars';
import { Badge } from '@/components/ui/badge';
import { ShopTabs } from '@/components/shop/shop-tabs';
import { storeConfig } from '@/config/store.config';
import type { ProductMini } from '@/lib/types';

interface ShopDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShopDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getShopDetails(slug);
  const shop = result.data;

  return {
    title: shop?.name ? `${shop.name} | ${storeConfig.content.name}` : `Shop | ${storeConfig.content.name}`,
    description: shop?.description || undefined,
  };
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-[8px] bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-all duration-300 hover:bg-[accent]/10 hover:text-[accent] dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-[accent]/20 dark:hover:text-[accent]"
    >
      {label}
    </a>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] bg-neutral-50 p-3 dark:bg-neutral-800/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[accent]/10">
        <Icon className="h-5 w-5 text-[accent]" />
      </div>
      <div>
        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      </div>
    </div>
  );
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { slug } = await params;

  const shopResult = await getShopDetails(slug);
  const shop = shopResult.data;

  if (!shop) {
    notFound();
  }

  // Fetch all product sets in parallel
  const [allRes, topRes, newRes, featuredRes] = await Promise.allSettled([
    getShopAllProducts(shop.id),
    getShopTopProducts(shop.id),
    getShopNewProducts(shop.id),
    getShopFeaturedProducts(shop.id),
  ]);

  const allProducts: ProductMini[] =
    allRes.status === 'fulfilled' ? allRes.value.data ?? [] : [];
  const topProducts: ProductMini[] =
    topRes.status === 'fulfilled' ? topRes.value.data ?? [] : [];
  const newProducts: ProductMini[] =
    newRes.status === 'fulfilled' ? newRes.value.data ?? [] : [];
  const featuredProducts: ProductMini[] =
    featuredRes.status === 'fulfilled' ? featuredRes.value.data ?? [] : [];

  // Use first slider image as banner, fall back to logo
  const bannerImage = shop.sliders?.length > 0 ? shop.sliders[0] : null;

  // Collect non-empty social links
  const socialLinks: { label: string; href: string }[] = [];
  if (shop.facebook) socialLinks.push({ label: 'Facebook', href: shop.facebook });
  if (shop.twitter) socialLinks.push({ label: 'Twitter', href: shop.twitter });
  if (shop.instagram) socialLinks.push({ label: 'Instagram', href: shop.instagram });
  if (shop.youtube) socialLinks.push({ label: 'YouTube', href: shop.youtube });

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <Link
              href="/"
              className="hover:text-[accent] transition-all duration-300"
            >
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href="/shops"
              className="hover:text-[accent] transition-all duration-300"
            >
              Shops
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
              {shop.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Banner */}
      <section className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64 lg:h-72">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={`${shop.name} banner`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-600" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </section>

      {/* Shop header card (overlaps banner) */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 rounded-[8px] border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Logo */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-neutral-50 shadow-md dark:border-neutral-800 dark:bg-neutral-800 sm:h-28 sm:w-28">
              {shop.logo ? (
                <Image
                  src={shop.logo}
                  alt={shop.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Store className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                </div>
              )}
            </div>

            {/* Shop info */}
            <div className="flex-1 min-w-0">
              {/* Name + Verified */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                  {shop.name}
                </h1>
                {shop.verified && (
                  <span className="inline-flex items-center gap-1" title="Verified Shop">
                    <CheckCircle2 className="h-5 w-5 text-[accent] fill-[accent]/10" />
                    <Badge variant="accent" size="sm">Verified</Badge>
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="mt-2">
                <RatingStars rating={shop.rating} size="md" showValue />
              </div>

              {/* Description */}
              {shop.description && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-3">
                  {shop.description}
                </p>
              )}

              {/* Contact info */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                {shop.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-[250px]">{shop.address}</span>
                  </span>
                )}
                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="inline-flex items-center gap-1.5 transition-all duration-300 hover:text-[accent]"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    {shop.phone}
                  </a>
                )}
                {shop.email && (
                  <a
                    href={`mailto:${shop.email}`}
                    className="inline-flex items-center gap-1.5 transition-all duration-300 hover:text-[accent]"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {shop.email}
                  </a>
                )}
              </div>

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <SocialLink key={link.label} href={link.href} label={link.label} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800 sm:grid-cols-3">
            <StatCard icon={Package} label="Products" value={shop.products} />
            <StatCard icon={ShoppingBag} label="Orders" value={shop.orders} />
            <StatCard icon={TrendingUp} label="Sales" value={shop.sales} />
          </div>
        </div>
      </div>

      {/* Products section with tabs */}
      <div className="container mx-auto px-4 py-10">
        <ShopTabs
          shopId={shop.id}
          allProducts={allProducts}
          topProducts={topProducts}
          newProducts={newProducts}
          featuredProducts={featuredProducts}
        />
      </div>
    </main>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { getFlashDeals } from '@/lib/api/home';
import { SectionHeader } from '@/components/home/section-header';
import { FlashDealBanner } from '@/components/home/flash-deal-banner';
import { storeConfig } from '@/config/store.config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Flash Deals | ${storeConfig.content.name}`,
  description: `Grab the best flash deals before they expire at ${storeConfig.content.name}.`,
};

export default async function FlashDealsPage() {
  let flashDeals: any[] = [];

  try {
    const res = await getFlashDeals();
    flashDeals = res.data || [];
  } catch {
    // fallback to empty
  }

  return (
    <div className="py-12">
      <div className="container mx-auto">
        <SectionHeader
          title="Flash Deals"
          subtitle="Limited-time offers you don't want to miss"
        />
      </div>

      {flashDeals.length === 0 ? (
        <div className="container mx-auto text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            No flash deals available right now. Check back soon!
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-btn font-medium transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-16">
          <FlashDealBanner flashDeals={flashDeals} />
        </div>
      )}
    </div>
  );
}

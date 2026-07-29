import { Truck, RotateCcw, ShieldCheck, Tag } from 'lucide-react';

const items = [
  { icon: Truck, label: 'Free Delivery', sub: 'On orders over ৳999' },
  { icon: RotateCcw, label: 'Easy Returns', sub: '7-day return policy' },
  { icon: ShieldCheck, label: 'Secure Payment', sub: '100% protected' },
  { icon: Tag, label: 'Best Price', sub: 'Guaranteed lowest' },
];

export function TrustBar() {
  return (
    <div className="border-y border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-4 px-4 md:px-6 border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 odd:border-r even:border-r-0 md:even:border-r md:last:border-r-0"
            >
              <Icon size={20} className="shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-900 dark:text-white font-display">
                  {label}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

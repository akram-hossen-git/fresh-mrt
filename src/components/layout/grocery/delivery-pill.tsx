'use client';

import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SameDayCutoff } from '@/components/home/grocery/same-day-cutoff';

/* ------------------------------------------------------------------ */
/*  Delivery Pill                                                      */
/*                                                                     */
/*  Compact block that anchors the grocery header:                     */
/*    Line 1: 📍 Deliver to <address>                                  */
/*    Line 2: Same-day · order within Xh Xm  (live countdown)          */
/*                                                                     */
/*  For now the address is a placeholder ("Deliver to Home"). A future */
/*  step will make it clickable and open an address / delivery-slot    */
/*  picker; the wireframe locked that as a later concern.              */
/* ------------------------------------------------------------------ */

interface DeliveryPillProps {
  className?: string;
  /** Layout variant: 'stacked' = 2 lines (desktop row1 / mobile), 'inline' = single line (compact) */
  variant?: 'stacked' | 'inline';
  /** Address label; defaults to "Home". Real value will come from user context later. */
  address?: string;
}

export function DeliveryPill({
  className,
  variant = 'stacked',
  address = 'Home',
}: DeliveryPillProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 text-xs md:text-sm text-neutral-700 dark:text-neutral-300',
          className,
        )}
      >
        <MapPin size={14} className="shrink-0 text-accent" strokeWidth={2.5} />
        <span className="truncate font-medium">Deliver to {address}</span>
        <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">·</span>
        <SameDayCutoff className="hidden sm:inline-flex items-center gap-1 text-accent-dark dark:text-accent" />
      </div>
    );
  }

  // stacked (default)
  return (
    <div
      className={cn(
        'flex flex-col leading-tight min-w-0',
        className,
      )}
    >
      <span className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-neutral-900 dark:text-white">
        <MapPin size={14} className="shrink-0 text-accent" strokeWidth={2.5} />
        <span className="truncate">Deliver to {address}</span>
      </span>
      <SameDayCutoff className="mt-0.5 inline-flex items-center gap-1 text-[11px] md:text-xs text-accent-dark dark:text-accent" />
    </div>
  );
}

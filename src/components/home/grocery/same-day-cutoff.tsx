'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Same-Day Cutoff Countdown                                          */
/*                                                                     */
/*  Grocery delivery model = same-day, order-by-2pm cutoff.            */
/*  Before 2pm  -> live countdown "Same-day · order within Hh Mm".     */
/*  After 2pm   -> "Order now · delivered tomorrow".                   */
/*                                                                     */
/*  NOTE: this is a display-only countdown to the 2pm cutoff. It is    */
/*  intentionally NOT a quick-commerce minutes timer.                  */
/* ------------------------------------------------------------------ */

const CUTOFF_HOUR = 14; // 2pm local

function msUntilCutoff(now: Date): number {
  const cutoff = new Date(now);
  cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);
  return cutoff.getTime() - now.getTime();
}

export function SameDayCutoff({ className }: { className?: string }) {
  // Avoid hydration mismatch: render nothing time-specific until mounted.
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    setMounted(true);
    const tick = () => setRemaining(msUntilCutoff(new Date()));
    tick();
    const interval = setInterval(tick, 60_000); // minute resolution is enough
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <span className={className}>
        <Clock size={15} strokeWidth={2.5} className="shrink-0" />
        <span>Same-day delivery available</span>
      </span>
    );
  }

  const beforeCutoff = remaining > 0;

  if (!beforeCutoff) {
    return (
      <span className={className}>
        <Clock size={15} strokeWidth={2.5} className="shrink-0" />
        <span>Order now · delivered tomorrow</span>
      </span>
    );
  }

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const window = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <span className={className}>
      <Clock size={15} strokeWidth={2.5} className="shrink-0" />
      <span>
        Same-day · order within{' '}
        <strong className="tabular-nums font-semibold">{window}</strong>
      </span>
    </span>
  );
}

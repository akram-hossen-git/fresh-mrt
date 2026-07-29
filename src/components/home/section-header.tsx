import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storeConfig } from '@/config/store.config';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  viewAllLink,
  className,
}: SectionHeaderProps) {
  const style = storeConfig.sections.sectionHeaderStyle;

  return (
    <div
      className={cn(
        'flex items-end justify-between gap-4 py-8 md:py-12',
        className,
      )}
    >
      <div className={cn('flex items-stretch gap-4', style === 'plain' && 'gap-0')}>
        {/* Accent bar — shown for 'accent-bar' style */}
        {style === 'accent-bar' && (
          <div className="w-1 bg-accent rounded-full" />
        )}
        <div className={cn(style === 'underline' && 'border-b-2 border-accent pb-2')}>
          <h2
            className="font-display text-2xl md:text-4xl lg:text-5xl font-black leading-none text-neutral-900 dark:text-white"
            style={{
              textTransform: storeConfig.theme.fonts.headingUppercase ? 'uppercase' : 'none',
              letterSpacing: 'var(--heading-tracking)',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-accent transition-colors mb-1"
        >
          All
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storeConfig } from '@/config/store.config';

const shopLinks = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Best Sellers', href: '/best-sellers' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/sale' },
  { label: 'Gift Cards', href: '/gift-cards' },
];

const helpLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'FAQ', href: '/faq' },
];

const aboutLinks = [
  { label: 'Our Story', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Press', href: '/press' },
];

function PinterestIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 12V5a7 7 0 0 1 14 0v7" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('bg-black text-white', className)}>
      {/* Main footer */}
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:pr-8">
            <Link
              href="/"
              className="inline-block font-display font-bold text-2xl tracking-[0.2em] mb-4"
            >
              {storeConfig.content.name}
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Curating timeless pieces that blend modern elegance with
              exceptional craftsmanship. Elevate your wardrobe with {storeConfig.content.name}.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Pinterest"
              >
                <PinterestIcon size={20} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Help" links={helpLinks} />
          <FooterColumn title="About" links={aboutLinks} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} {storeConfig.content.name}. All rights reserved.
          </p>

          {/* Payment icons placeholder */}
          <div className="flex items-center gap-3">
            {['Visa', 'Mastercard', 'Amex', 'PayPal'].map((name) => (
              <span
                key={name}
                className="inline-flex items-center justify-center h-6 px-2 bg-neutral-800 rounded text-[10px] text-neutral-400 font-medium"
              >
                {name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

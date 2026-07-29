import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  if (typeof price === 'string') return price;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export function generateTempUserId(): string {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function getDiscountPercent(discount: string): number {
  const match = discount.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function timeLeft(timestamp: number): { days: number; hours: number; minutes: number; seconds: number } {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, timestamp - now);
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

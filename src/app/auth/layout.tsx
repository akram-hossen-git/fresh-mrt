import React from 'react';
import Link from 'next/link';
import { storeConfig } from '@/config/store.config';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex">
      {/* Left side — decorative fashion panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Branding content */}
        <div className="relative z-10 px-12 text-center">
          <Link href="/" className="inline-block mb-8">
            <span className="font-display text-4xl font-bold text-white tracking-wider">
              {storeConfig.content.name}
            </span>
          </Link>
          <p className="text-lg text-gray-300 max-w-sm mx-auto leading-relaxed">
            Discover premium fashion curated for the modern connoisseur
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              Free Shipping
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              Exclusive Access
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              Premium Quality
            </span>
          </div>
        </div>
      </div>

      {/* Right side — form content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950">
        {children}
      </div>
    </div>
  );
}

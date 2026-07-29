'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] transition-all duration-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center w-10 h-10 text-gray-400 dark:text-gray-500 select-none"
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={isActive}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex items-center justify-center w-10 h-10 rounded-[8px] text-sm font-medium transition-all duration-300',
              isActive
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] transition-all duration-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

function buildPageList(
  current: number,
  total: number
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Always show first page
  pages.push(1);

  if (current > 3) {
    pages.push('ellipsis');
  }

  // Pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  // Always show last page
  pages.push(total);

  return pages;
}

export { Pagination };

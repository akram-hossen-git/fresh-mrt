'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Pagination } from '@/components/ui/pagination';

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function CategoryPagination({ currentPage, totalPages }: CategoryPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname, searchParams]
  );

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}

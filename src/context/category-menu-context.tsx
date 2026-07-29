'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import type { MenuCategory } from '@/lib/types/category';

interface CategoryMenuContextType {
  categories: MenuCategory[];
  loading: boolean;
}

const CategoryMenuContext = createContext<CategoryMenuContextType>({
  categories: [],
  loading: true,
});

export function CategoryMenuProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ success: boolean; data: MenuCategory[] }>('/categories/menu')
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch(() => {
        // Silently fail — menu just won't show categories
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <CategoryMenuContext.Provider value={{ categories, loading }}>
      {children}
    </CategoryMenuContext.Provider>
  );
}

export function useCategoryMenu() {
  return useContext(CategoryMenuContext);
}

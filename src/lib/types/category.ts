export interface Category {
  id: number;
  slug: string;
  name: string;
  banner: string;
  cover_image: string;
  icon: string;
  number_of_children: number;
  links: {
    products: string;
    sub_categories: string;
  };
}

export interface HomeCategory {
  name: string;
  banner: string;
  icon: string;
  links: {
    products: string;
    sub_categories: string;
  };
}

/**
 * Shape returned by GET /sub-categories/{id}.
 *
 * That route hits SubCategoryController@index, which wraps the result in the
 * same CategoryCollection resource used by /categories — so children come back
 * with images at ANY depth (level 2, level 3, ...), not just the top level.
 * This is why the grocery rail can show sub-sub-categories with icons even
 * though /categories/menu drops `icon` on its third level.
 */
export interface SubCategory {
  id: number;
  slug: string;
  name: string;
  banner: string;
  cover_image: string;
  icon: string;
  number_of_children: number;
  links: {
    products: string;
    sub_categories: string;
  };
}

export interface MenuSubSubCategory {
  id: number;
  slug: string;
  name: string;
}

export interface MenuSubCategory {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  /** Tile image for the grocery two-pane category browser. */
  cover_image?: string | null;
  children: MenuSubSubCategory[];
}

export interface MenuCategory {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  banner: string | null;
  cover_image: string | null;
  children: MenuSubCategory[];
}

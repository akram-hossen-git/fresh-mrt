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

export interface SubCategory {
  name: string;
  links: { products: string };
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

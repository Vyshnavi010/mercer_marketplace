export type ProductCategory =
  | 'Electronics'
  | 'Apparel'
  | 'Footwear'
  | 'Accessories'
  | 'Home & Studio';

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  specs: string[];
  inStock: boolean;
  featuredRank: number;
}

export interface FilterCriteria {
  categories?: ProductCategory[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  sortBy?: SortOption | null;
}

export interface PriceBounds {
  min: number;
  max: number;
}

export interface InventoryResponse {
  items: Product[];
  totalCount: number;
  filteredCount: number;
  priceBounds: PriceBounds;
  categories: ProductCategory[];
  categoryCounts: Record<ProductCategory, number>;
  appliedFilters: {
    categories: ProductCategory[];
    minPrice: number;
    maxPrice: number;
    minRating: number | null;
    sortBy: SortOption;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

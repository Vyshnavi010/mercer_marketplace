import type {
  FilterCriteria,
  InventoryResponse,
  PriceBounds,
  Product,
  ProductCategory,
  SortOption,
} from '../src/shared/types.ts';
import { MASTER_INVENTORY, PRODUCT_CATEGORIES } from './catalogData.ts';

const VALID_SORT_OPTIONS = new Set<SortOption>([
  'featured',
  'price-asc',
  'price-desc',
  'rating-desc',
]);

const VALID_CATEGORIES = new Set<ProductCategory>(PRODUCT_CATEGORIES);

/**
 * Computes global min/max price bounds from the master product inventory array.
 */
export function computeInventoryPriceBounds(
  inventory: readonly Product[] = MASTER_INVENTORY
): PriceBounds {
  if (inventory.length === 0) {
    return { min: 0, max: 1000 };
  }
  let min = inventory[0].price;
  let max = inventory[0].price;
  for (let i = 1; i < inventory.length; i++) {
    const p = inventory[i].price;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

/**
 * Core Combinatorial Intersect Filtering + Pipeline Sorting Engine.
 *
 * 1. Graceful Null Handling:
 *    If any filter (or all filters) is null, undefined, or empty, that reduction
 *    pass is safely bypassed so the full base inventory is returned seamlessly.
 * 2. Combinatorial Intersect Filtering:
 *    Executes a comprehensive search loop over the master inventory array,
 *    retaining a product only if it satisfies ALL active criteria:
 *      - Category checklist inclusion
 *      - Dual-point price boundary [minPrice, maxPrice]
 *      - Minimum star rating (>= minRating)
 * 3. Pipeline Sorting ("The Vibe Check"):
 *    Filters the original dataset FIRST, then orders the remaining matched
 *    products based on the active sortBy option.
 */
export function filterAndSortInventory(
  criteria: FilterCriteria = {},
  masterInventory: readonly Product[] = MASTER_INVENTORY
): InventoryResponse {
  const globalBounds = computeInventoryPriceBounds(masterInventory);

  // Normalize & validate categories (Graceful Null Handling)
  const rawCategories = Array.isArray(criteria.categories)
    ? criteria.categories.filter((c): c is ProductCategory => VALID_CATEGORIES.has(c))
    : [];
  const selectedCategoriesSet = new Set<ProductCategory>(rawCategories);
  const hasCategoryFilter = selectedCategoriesSet.size > 0;

  // Normalize & validate dual-point price boundaries
  const rawMin =
    typeof criteria.minPrice === 'number' && Number.isFinite(criteria.minPrice)
      ? criteria.minPrice
      : null;
  const rawMax =
    typeof criteria.maxPrice === 'number' && Number.isFinite(criteria.maxPrice)
      ? criteria.maxPrice
      : null;

  let effectiveMinPrice =
    rawMin !== null
      ? Math.max(globalBounds.min, Math.min(globalBounds.max, rawMin))
      : globalBounds.min;
  let effectiveMaxPrice =
    rawMax !== null
      ? Math.max(globalBounds.min, Math.min(globalBounds.max, rawMax))
      : globalBounds.max;

  if (effectiveMinPrice > effectiveMaxPrice) {
    const swap = effectiveMinPrice;
    effectiveMinPrice = effectiveMaxPrice;
    effectiveMaxPrice = swap;
  }

  const hasMinPriceFilter = rawMin !== null && effectiveMinPrice > globalBounds.min;
  const hasMaxPriceFilter = rawMax !== null && effectiveMaxPrice < globalBounds.max;

  // Normalize & validate minimum star rating
  const rawRating =
    typeof criteria.minRating === 'number' &&
    Number.isFinite(criteria.minRating) &&
    criteria.minRating > 0
      ? Math.min(5, Math.max(1, criteria.minRating))
      : null;
  const hasRatingFilter = rawRating !== null;

  // Initialize contextual category facet counts (respecting active price & rating filters)
  const categoryCounts: Record<ProductCategory, number> = {
    Electronics: 0,
    Apparel: 0,
    Footwear: 0,
    Accessories: 0,
    'Home & Studio': 0,
  };

  // Phase 1: Combinatorial Intersect Filtering Loop over Master Inventory
  const filteredItems: Product[] = [];

  for (let i = 0; i < masterInventory.length; i++) {
    const product = masterInventory[i];

    // Check price boundary
    const satisfiesPrice =
      (!hasMinPriceFilter || product.price >= effectiveMinPrice) &&
      (!hasMaxPriceFilter || product.price <= effectiveMaxPrice);

    // Check minimum star rating
    const satisfiesRating = !hasRatingFilter || product.rating >= rawRating;

    // Update contextual category count when price and rating match
    if (satisfiesPrice && satisfiesRating) {
      categoryCounts[product.category] =
        (categoryCounts[product.category] ?? 0) + 1;
    }

    // Check category checklist selection
    const satisfiesCategory =
      !hasCategoryFilter || selectedCategoriesSet.has(product.category);

    // Combinatorial intersection: must satisfy all three criteria simultaneously
    if (satisfiesCategory && satisfiesPrice && satisfiesRating) {
      filteredItems.push(product);
    }
  }

  // Phase 2: Visual Presentation Sorting Pipeline (after filtering original dataset)
  const sortBy: SortOption =
    criteria.sortBy && VALID_SORT_OPTIONS.has(criteria.sortBy)
      ? criteria.sortBy
      : 'featured';

  const sortedItems = [...filteredItems];

  switch (sortBy) {
    case 'price-asc':
      sortedItems.sort((a, b) => a.price - b.price || b.rating - a.rating);
      break;
    case 'price-desc':
      sortedItems.sort((a, b) => b.price - a.price || b.rating - a.rating);
      break;
    case 'rating-desc':
      sortedItems.sort(
        (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount || a.price - b.price
      );
      break;
    case 'featured':
    default:
      sortedItems.sort((a, b) => a.featuredRank - b.featuredRank);
      break;
  }

  return {
    items: sortedItems,
    totalCount: masterInventory.length,
    filteredCount: sortedItems.length,
    priceBounds: globalBounds,
    categories: PRODUCT_CATEGORIES,
    categoryCounts,
    appliedFilters: {
      categories: Array.from(selectedCategoriesSet),
      minPrice: effectiveMinPrice,
      maxPrice: effectiveMaxPrice,
      minRating: rawRating,
      sortBy,
    },
  };
}

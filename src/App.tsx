import { SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartDrawer } from './components/CartDrawer.tsx';
import { FilterSidebar } from './components/FilterSidebar.tsx';
import { Header } from './components/Header.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductModal } from './components/ProductModal.tsx';
import { SortDropdown } from './components/SortDropdown.tsx';
import type {
  CartItem,
  InventoryResponse,
  PriceBounds,
  Product,
  ProductCategory,
  SortOption,
} from './shared/types.ts';

const DEFAULT_BOUNDS: PriceBounds = { min: 34, max: 680 };

const DEFAULT_CATEGORIES: ProductCategory[] = [
  'Electronics',
  'Apparel',
  'Footwear',
  'Accessories',
  'Home & Studio',
];

const DEFAULT_COUNTS: Record<ProductCategory, number> = {
  Electronics: 0,
  Apparel: 0,
  Footwear: 0,
  Accessories: 0,
  'Home & Studio': 0,
};

export default function App() {
  // Filter & sort state
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [priceBounds, setPriceBounds] = useState<PriceBounds>(DEFAULT_BOUNDS);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Server response state
  const [inventoryData, setInventoryData] = useState<InventoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mobile filter drawer, product detail modal, and shopping bag drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Track whether price change came from slider drag (short coalesce) vs immediate click
  const debounceTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const effectiveMinPrice = minPrice ?? priceBounds.min;
  const effectiveMaxPrice = maxPrice ?? priceBounds.max;

  const isPriceFiltered =
    effectiveMinPrice > priceBounds.min || effectiveMaxPrice < priceBounds.max;

  const hasActiveFilters =
    selectedCategories.length > 0 || isPriceFiltered || minRating !== null;

  const activeFilterCount =
    selectedCategories.length +
    (isPriceFiltered ? 1 : 0) +
    (minRating !== null ? 1 : 0);

  const fetchInventory = useCallback(
    async (params: {
      categories: ProductCategory[];
      minPrice: number | null;
      maxPrice: number | null;
      minRating: number | null;
      sortBy: SortOption;
    }) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setErrorMessage(null);
        const response = await fetch('/api/inventory/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categories: params.categories.length > 0 ? params.categories : null,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            minRating: params.minRating,
            sortBy: params.sortBy,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const payload: InventoryResponse = await response.json();
        setInventoryData(payload);
        setPriceBounds(payload.priceBounds);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setErrorMessage('Unable to load catalog inventory. Please try again.');
        setIsLoading(false);
      }
    },
    []
  );

  // Trigger instant query on filter/sort changes (40ms coalesce only when dragging price)
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(
      () => {
        void fetchInventory({
          categories: selectedCategories,
          minPrice,
          maxPrice,
          minRating,
          sortBy,
        });
      },
      minPrice !== null || maxPrice !== null ? 35 : 0
    );

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [selectedCategories, minPrice, maxPrice, minRating, sortBy, fetchInventory]);

  // Lock body scroll when mobile filter drawer is open & support Escape
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileFiltersOpen]);

  const handleToggleCategory = (category: ProductCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleQuickSelectCategory = (category: ProductCategory | null) => {
    if (category === null) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([category]);
    }
  };

  const handlePriceChange = (nextMin: number, nextMax: number) => {
    setMinPrice(nextMin <= priceBounds.min ? null : nextMin);
    setMaxPrice(nextMax >= priceBounds.max ? null : nextMax);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinRating(null);
  };

  // Shopping bag handlers
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.product.id === product.id);
      if (existing) {
        return prev.map((entry) =>
          entry.product.id === product.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((entry) =>
          entry.product.id === productId
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((entry) => entry.product.id !== productId)
    );
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const items = inventoryData?.items ?? [];
  const totalCount = inventoryData?.totalCount ?? 24;
  const filteredCount = inventoryData?.filteredCount ?? 0;
  const categories = inventoryData?.categories ?? DEFAULT_CATEGORIES;
  const categoryCounts = inventoryData?.categoryCounts ?? DEFAULT_COUNTS;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeCategories={selectedCategories}
        onQuickSelectCategory={handleQuickSelectCategory}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Main Storefront Workspace */}
      <main
        id="catalog"
        className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10"
      >
        {/* Editorial Page Intro */}
        <div className="pb-6 mb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Hardware, Apparel & Everyday Carry
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600">
              Filter across category, price boundary, and verified customer rating with instant results.
            </p>
          </div>
          <p className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap shrink-0">
            {isLoading
              ? 'Loading catalog...'
              : `${filteredCount} of ${totalCount} items shown`}
          </p>
        </div>

        <div className="lg:flex lg:items-start lg:gap-10">
          {/* Desktop Sticky Sidebar Layout */}
          <aside
            aria-label="Product filters"
            className="hidden lg:block w-72 shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto pr-2"
          >
            <FilterSidebar
              categories={categories}
              categoryCounts={categoryCounts}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              priceBounds={priceBounds}
              minPrice={effectiveMinPrice}
              maxPrice={effectiveMaxPrice}
              onPriceChange={handlePriceChange}
              minRating={minRating}
              onRatingChange={setMinRating}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          </aside>

          {/* Main Right-Hand Section: Controls Bar + Dynamic Product Inventory Grid */}
          <section className="flex-1 min-w-0" aria-label="Product catalog">
            {/* Top Controls Row (Mobile Filter Trigger + Active Filter Summary + Sort By Dropdown) */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Mobile/Tablet Filter Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                >
                  <SlidersHorizontal className="h-4 w-4 text-slate-600" strokeWidth={1.75} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="font-mono tabular-nums text-xs text-blue-700 font-semibold">
                      ({activeFilterCount})
                    </span>
                  )}
                </button>

                {/* Active Interactive Filter Removal Buttons */}
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>{cat}</span>
                    <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  </button>
                ))}

                {isPriceFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice(null);
                      setMaxPrice(null);
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium font-mono tabular-nums text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>
                      ${effectiveMinPrice}–${effectiveMaxPrice}
                    </span>
                    <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  </button>
                )}

                {minRating !== null && (
                  <button
                    type="button"
                    onClick={() => setMinRating(null)}
                    className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>
                      {minRating === 5 ? '5 stars' : `${minRating}+ stars`}
                    </span>
                    <X className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Top-Right Sort By Dropdown Menu */}
              <div className="ml-auto">
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>

            {/* Error State */}
            {errorMessage && (
              <div className="p-6 bg-white border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() =>
                    void fetchInventory({
                      categories: selectedCategories,
                      minPrice,
                      maxPrice,
                      minRating,
                      sortBy,
                    })
                  }
                  className="min-h-[40px] px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Initial Skeleton State */}
            {isLoading && !inventoryData && !errorMessage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 w-28 bg-slate-200 rounded" />
                      <div className="h-4 w-4/5 bg-slate-200 rounded" />
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <div className="h-5 w-14 bg-slate-200 rounded" />
                        <div className="h-9 w-24 bg-slate-200 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Zero-Match Empty State Screen */}
            {!isLoading && !errorMessage && items.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl px-6 py-16 text-center flex flex-col items-center justify-center">
                <h2 className="text-lg font-semibold text-slate-900">
                  No items match your criteria.
                </h2>
                <p className="mt-2 text-sm text-slate-600 max-w-md">
                  Your current combination of category, price bounds, and minimum rating returned zero products.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 min-h-[44px] px-6 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
                >
                  Reset filters
                </button>
              </div>
            )}

            {/* Dynamic Product Inventory Grid */}
            {!errorMessage && items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setActiveProduct}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>Mercer Supply — Curated Marketplace Goods</span>
          <span>Free shipping on orders over $150 · 30-day returns</span>
        </div>
      </footer>

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex bg-slate-950/50 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">
                Filter Catalog
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterSidebar
                categories={categories}
                categoryCounts={categoryCounts}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                priceBounds={priceBounds}
                minPrice={effectiveMinPrice}
                maxPrice={effectiveMaxPrice}
                onPriceChange={handlePriceChange}
                minRating={minRating}
                onRatingChange={setMinRating}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 min-h-[44px] px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg font-mono tabular-nums cursor-pointer"
              >
                View {filteredCount} {filteredCount === 1 ? 'item' : 'items'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Quick-View Modal */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-Over Shopping Bag Drawer */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />
    </div>
  );
}

import { ShoppingBag } from 'lucide-react';
import type { ProductCategory } from '../shared/types.ts';

interface HeaderProps {
  activeCategories: ProductCategory[];
  onQuickSelectCategory: (category: ProductCategory | null) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const NAV_ITEMS: Array<{ label: string; category: ProductCategory | null }> = [
  { label: 'All Catalog', category: null },
  { label: 'Electronics', category: 'Electronics' },
  { label: 'Apparel', category: 'Apparel' },
  { label: 'Footwear', category: 'Footwear' },
];

export function Header({
  activeCategories,
  onQuickSelectCategory,
  cartCount,
  onOpenCart,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#catalog"
          onClick={(e) => {
            e.preventDefault();
            onQuickSelectCategory(null);
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
        >
          Mercer Supply
        </a>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary categories"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.category === null
                ? activeCategories.length === 0
                : activeCategories.length === 1 &&
                  activeCategories[0] === item.category;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onQuickSelectCategory(item.category)}
                className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm ${
                  isActive
                    ? 'text-slate-900 border-blue-700'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping bag with ${cartCount} items`}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            <span>Bag</span>
            <span className="font-mono tabular-nums text-xs text-slate-300">
              ({cartCount})
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

import { Check, RotateCcw } from 'lucide-react';
import type { PriceBounds, ProductCategory } from '../shared/types.ts';
import { PriceRangeSlider } from './PriceRangeSlider.tsx';
import { StarRating } from './StarRating.tsx';

interface FilterSidebarProps {
  categories: ProductCategory[];
  categoryCounts: Record<ProductCategory, number>;
  selectedCategories: ProductCategory[];
  onToggleCategory: (category: ProductCategory) => void;
  priceBounds: PriceBounds;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (nextMin: number, nextMax: number) => void;
  minRating: number | null;
  onRatingChange: (nextRating: number | null) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

const RATING_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 5, label: '5 stars' },
  { value: 4, label: '4 stars & up' },
  { value: 3, label: '3 stars & up' },
  { value: 2, label: '2 stars & up' },
  { value: 1, label: '1 star & up' },
];

export function FilterSidebar({
  categories,
  categoryCounts,
  selectedCategories,
  onToggleCategory,
  priceBounds,
  minPrice,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  hasActiveFilters,
  onResetFilters,
}: FilterSidebarProps) {
  return (
    <div className="divide-y divide-slate-200">
      {/* Sidebar Header */}
      <div className="pb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900 tracking-tight">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 py-1.5 px-2 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Reset all
          </button>
        )}
      </div>

      {/* 1. Category Checklist Group */}
      <fieldset className="py-5">
        <legend className="text-sm font-semibold text-slate-900 mb-3">
          Category
        </legend>
        <div className="space-y-1">
          {categories.map((category) => {
            const checked = selectedCategories.includes(category);
            const count = categoryCounts[category] ?? 0;

            return (
              <label
                key={category}
                className="flex items-center justify-between gap-3 min-h-[44px] lg:min-h-[38px] px-2 -mx-2 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer select-none"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCategory(category)}
                    className="sr-only peer"
                  />
                  <span
                    aria-hidden="true"
                    className={`h-4.5 w-4.5 rounded flex items-center justify-center border transition-colors shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-700 ${
                      checked
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.75} />
                  </span>
                  <span
                    className={`text-sm truncate ${
                      checked ? 'font-medium text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {category}
                  </span>
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 2. Dual-Point Price Range Slider */}
      <div className="py-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Price range
        </h3>
        <PriceRangeSlider
          boundsMin={priceBounds.min}
          boundsMax={priceBounds.max}
          minValue={minPrice}
          maxValue={maxPrice}
          onChange={onPriceChange}
        />
      </div>

      {/* 3. Minimum Star Rating Radio Group (1 to 5 Stars) */}
      <fieldset className="pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <legend className="text-sm font-semibold text-slate-900">
            Minimum rating
          </legend>
          {minRating !== null && (
            <button
              type="button"
              onClick={() => onRatingChange(null)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1" role="radiogroup" aria-label="Minimum star rating">
          <label className="flex items-center gap-3 min-h-[44px] lg:min-h-[38px] px-2 -mx-2 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer select-none">
            <input
              type="radio"
              name="minimum-star-rating"
              checked={minRating === null}
              onChange={() => onRatingChange(null)}
              className="sr-only peer"
            />
            <span
              aria-hidden="true"
              className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                minRating === null
                  ? 'border-blue-700 bg-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {minRating === null && (
                <span className="h-2 w-2 rounded-full bg-blue-700" />
              )}
            </span>
            <span
              className={`text-sm ${
                minRating === null
                  ? 'font-medium text-slate-900'
                  : 'text-slate-700'
              }`}
            >
              Any rating
            </span>
          </label>

          {RATING_OPTIONS.map((option) => {
            const isSelected = minRating === option.value;
            return (
              <label
                key={option.value}
                className="flex items-center justify-between gap-2 min-h-[44px] lg:min-h-[38px] px-2 -mx-2 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer select-none"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="minimum-star-rating"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => onRatingChange(option.value)}
                    className="sr-only peer"
                  />
                  <span
                    aria-hidden="true"
                    className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-blue-700 bg-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-blue-700" />
                    )}
                  </span>
                  <StarRating rating={option.value} showNumeric={false} size="sm" />
                </span>
                <span
                  className={`text-xs whitespace-nowrap ${
                    isSelected ? 'font-medium text-slate-900' : 'text-slate-600'
                  }`}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

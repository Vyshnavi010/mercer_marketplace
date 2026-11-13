import { Check, Package, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../shared/types.ts';
import { StarRating } from './StarRating.tsx';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  product,
  onSelect,
  onAddToCart,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <article className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      {/* Studio Image Thumbnail */}
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
      >
        {!imageFailed ? (
          <img
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
            <Package className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
            <span className="text-xs font-medium text-center line-clamp-1">
              {product.name}
            </span>
          </div>
        )}
      </button>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          {/* Unboxed clean metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.brand}</span>
          </div>

          {/* Item Name */}
          <h3 className="text-base font-semibold text-slate-900 leading-snug">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="text-left hover:text-blue-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              {product.name}
            </button>
          </h3>

          {/* Star Rating Display */}
          <div className="pt-0.5">
            <StarRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          </div>
        </div>

        {/* Baseline Price Tag & Add Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-base font-semibold font-mono tabular-nums text-slate-900">
            ${product.price.toFixed(0)}
          </span>

          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-blue-700 hover:text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Add to bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

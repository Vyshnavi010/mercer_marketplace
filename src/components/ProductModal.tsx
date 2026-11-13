import { Check, Package, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '../shared/types.ts';
import { StarRating } from './StarRating.tsx';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductModal({
  product,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setAdded(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.brand}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-[4/3] md:aspect-auto md:h-full bg-slate-100">
            {!imageFailed ? (
              <img
                src={product.image}
                alt={`${product.brand} ${product.name}`}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 text-slate-400">
                <Package className="h-12 w-12" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h2
                  id="product-modal-title"
                  className="text-xl font-semibold text-slate-900 leading-snug"
                >
                  {product.name}
                </h2>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <StarRating
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    size="md"
                  />
                  <span className="text-xl font-semibold font-mono tabular-nums text-slate-900">
                    ${product.price.toFixed(0)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-900 mb-2">
                  Specifications
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {product.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`w-full min-h-[44px] px-5 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.25} />
                  <span>Added to bag</span>
                </>
              ) : (
                <span>Add to bag — ${product.price.toFixed(0)}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

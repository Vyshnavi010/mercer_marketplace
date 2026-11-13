import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CartItem } from '../shared/types.ts';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    if (!open) {
      setCheckedOut(false);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-slate-800" strokeWidth={1.75} />
            <h2 className="text-base font-semibold text-slate-900">
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {checkedOut ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12 space-y-3">
              <p className="text-base font-semibold text-slate-900">
                Order request confirmed
              </p>
              <p className="text-sm text-slate-600 max-w-xs">
                Your selected items have been reserved for fulfillment. Thank you for shopping with Mercer Supply.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 min-h-[40px] px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Continue browsing
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12 space-y-2">
              <ShoppingBag
                className="h-10 w-10 text-slate-300 mb-1"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium text-slate-900">
                Your bag is empty
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Use the multi-filter sidebar to browse the catalog and add products to your bag.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="py-4 flex gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-20 w-24 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">
                          {product.brand}
                        </p>
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {product.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-slate-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, -1)}
                          aria-label="Decrease quantity"
                          className="h-8 w-8 inline-flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono tabular-nums text-slate-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, 1)}
                          aria-label="Increase quantity"
                          className="h-8 w-8 inline-flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold font-mono tabular-nums text-slate-900">
                        ${(product.price * quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && !checkedOut && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-lg font-semibold font-mono tabular-nums text-slate-900">
                ${subtotal.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClearCart}
                className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setCheckedOut(true);
                }}
                className="flex-1 min-h-[44px] px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SortOption } from '../shared/types.ts';

export interface SortChoice {
  value: SortOption;
  label: string;
}

export const SORT_CHOICES: SortChoice[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated First' },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (nextSort: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeChoice =
    SORT_CHOICES.find((choice) => choice.value === value) ?? SORT_CHOICES[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Sort products"
        className="inline-flex items-center justify-between gap-2.5 min-h-[44px] lg:min-h-[40px] px-3.5 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
      >
        <span className="text-slate-500 font-normal">Sort by:</span>
        <span className="text-slate-900 font-medium">{activeChoice.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort order"
          className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40"
        >
          {SORT_CHOICES.map((choice) => {
            const isSelected = choice.value === value;
            return (
              <li key={choice.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(choice.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 text-blue-800 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="whitespace-nowrap">{choice.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-blue-700 shrink-0" strokeWidth={2} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

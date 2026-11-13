import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
  showNumeric?: boolean;
  reviewCount?: number;
}

export function StarRating({
  rating,
  size = 'sm',
  showNumeric = true,
  reviewCount,
}: StarRatingProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const roundedHalf = Math.round(rating * 2) / 2;

  return (
    <div
      className="inline-flex items-center gap-1.5"
      aria-label={`Rated ${rating.toFixed(1)} out of 5 stars`}
    >
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = roundedHalf >= starIndex;
          const isHalf = !isFull && roundedHalf >= starIndex - 0.5;

          if (isFull) {
            return (
              <Star
                key={starIndex}
                className={`${iconSize} fill-amber-500 text-amber-500`}
                strokeWidth={1.75}
              />
            );
          }

          if (isHalf) {
            return (
              <span key={starIndex} className={`relative inline-block ${iconSize}`}>
                <Star
                  className={`${iconSize} text-slate-300`}
                  strokeWidth={1.75}
                />
                <span className="absolute inset-0 overflow-hidden w-1/2">
                  <Star
                    className={`${iconSize} fill-amber-500 text-amber-500`}
                    strokeWidth={1.75}
                  />
                </span>
              </span>
            );
          }

          return (
            <Star
              key={starIndex}
              className={`${iconSize} text-slate-300`}
              strokeWidth={1.75}
            />
          );
        })}
      </div>

      {showNumeric && (
        <span className="text-xs font-medium text-slate-700 tabular-nums">
          {rating.toFixed(1)}
          {typeof reviewCount === 'number' && (
            <span className="text-slate-400 font-normal"> ({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
}

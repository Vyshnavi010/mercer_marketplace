import type { ChangeEvent } from 'react';

interface PriceRangeSliderProps {
  boundsMin: number;
  boundsMax: number;
  minValue: number;
  maxValue: number;
  onChange: (nextMin: number, nextMax: number) => void;
}

export function PriceRangeSlider({
  boundsMin,
  boundsMax,
  minValue,
  maxValue,
  onChange,
}: PriceRangeSliderProps) {
  const safeSpan = Math.max(1, boundsMax - boundsMin);
  const clampedMin = Math.max(boundsMin, Math.min(minValue, maxValue));
  const clampedMax = Math.min(boundsMax, Math.max(maxValue, clampedMin));

  const minPercent = ((clampedMin - boundsMin) / safeSpan) * 100;
  const maxPercent = ((clampedMax - boundsMin) / safeSpan) * 100;

  // Keep a small minimum visual gap unless bounds collapse
  const minGap = Math.min(10, Math.floor(safeSpan / 4));

  const handleMinRange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const nextMin = Math.min(raw, clampedMax - minGap);
    onChange(Math.max(boundsMin, nextMin), clampedMax);
  };

  const handleMaxRange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const nextMax = Math.max(raw, clampedMin + minGap);
    onChange(clampedMin, Math.min(boundsMax, nextMax));
  };

  const handleMinInput = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(e.target.value);
    if (!Number.isFinite(parsed)) return;
    const bounded = Math.max(boundsMin, Math.min(parsed, clampedMax));
    onChange(bounded, clampedMax);
  };

  const handleMaxInput = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(e.target.value);
    if (!Number.isFinite(parsed)) return;
    const bounded = Math.min(boundsMax, Math.max(parsed, clampedMin));
    onChange(clampedMin, bounded);
  };

  // Prioritize z-index of min thumb when thumbs are near the upper end so it never gets trapped
  const minThumbOnTop = clampedMin > boundsMin + safeSpan * 0.75;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-600 font-mono tabular-nums">
        <span>${clampedMin}</span>
        <span>${clampedMax}</span>
      </div>

      {/* Dual-Point Slider Track */}
      <div className="relative h-8 flex items-center select-none touch-none">
        {/* Base Track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
        {/* Active Range Track */}
        <div
          className="absolute h-1.5 rounded-full bg-blue-700 transition-all duration-75"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />

        <input
          type="range"
          min={boundsMin}
          max={boundsMax}
          step={1}
          value={clampedMin}
          onChange={handleMinRange}
          aria-label="Minimum price"
          className={`dual-range-input ${minThumbOnTop ? 'z-30' : 'z-20'}`}
        />
        <input
          type="range"
          min={boundsMin}
          max={boundsMax}
          step={1}
          value={clampedMax}
          onChange={handleMaxRange}
          aria-label="Maximum price"
          className={`dual-range-input ${minThumbOnTop ? 'z-20' : 'z-30'}`}
        />
      </div>

      {/* Synchronized Numeric Bound Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Min price</span>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs text-slate-400 font-mono pointer-events-none">
              $
            </span>
            <input
              type="number"
              min={boundsMin}
              max={clampedMax}
              value={clampedMin}
              onChange={handleMinInput}
              aria-label="Minimum price input"
              className="w-full min-h-[40px] pl-6 pr-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs text-slate-500 mb-1">Max price</span>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs text-slate-400 font-mono pointer-events-none">
              $
            </span>
            <input
              type="number"
              min={clampedMin}
              max={boundsMax}
              value={clampedMax}
              onChange={handleMaxInput}
              aria-label="Maximum price input"
              className="w-full min-h-[40px] pl-6 pr-2.5 py-1.5 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/15"
            />
          </div>
        </label>
      </div>
    </div>
  );
}

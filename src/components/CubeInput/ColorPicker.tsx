import React from 'react';
import { CubeColor } from '../../types/cube';
import { COLOR_HEX, COLOR_NAMES } from '../../cube/constants';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  activeColor: CubeColor;
  onSelectColor: (color: CubeColor) => void;
  counts: Record<CubeColor, number>;
}

const COLORS: CubeColor[] = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  activeColor,
  onSelectColor,
  counts,
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Paint Palette
        </span>
        <span className="text-xs text-slate-500">
          Selected: <strong className="text-slate-200 capitalize">{COLOR_NAMES[activeColor]}</strong>
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {COLORS.map(color => {
          const isSelected = activeColor === color;
          const count = counts[color] || 0;
          const isFull = count === 9;
          const isOver = count > 9;

          return (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                isSelected
                  ? 'border-white ring-2 ring-blue-500/50 scale-105 shadow-lg'
                  : 'border-slate-800 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              {/* Color Swatch Circle */}
              <div
                className="w-7 h-7 rounded-lg shadow-inner flex items-center justify-center border border-black/20"
                style={{ backgroundColor: COLOR_HEX[color] }}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${
                      color === 'white' || color === 'yellow' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </div>

              {/* Count Indicator */}
              <div className="mt-1.5 flex items-center gap-0.5">
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isFull
                      ? 'text-emerald-400'
                      : isOver
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {count}
                </span>
                <span className="text-[10px] text-slate-500">/9</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

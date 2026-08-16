import React, { useState } from 'react';
import { Face, NotationMove } from '../../types/cube';

interface VirtualKeypadProps {
  onMoveClick: (move: NotationMove) => void;
  disabled?: boolean;
}

const PRIMARY_FACES: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
const SLICE_ROTATIONS: NotationMove[] = [
  'M', 'M\'', 'M2',
  'E', 'E\'', 'E2',
  'S', 'S\'', 'S2',
  'x', 'x\'', 'x2',
  'y', 'y\'', 'y2',
  'z', 'z\'', 'z2'
];

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({
  onMoveClick,
  disabled = false,
}) => {
  const [tab, setTab] = useState<'faces' | 'slices'>('faces');

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('faces')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              tab === 'faces'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Face Turns
          </button>
          <button
            onClick={() => setTab('slices')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              tab === 'slices'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Slices & Rotations
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">Keyboard: U, D, L, R, F, B (+Shift for ')</span>
      </div>

      {tab === 'faces' ? (
        <div className="grid grid-cols-6 gap-2">
          {PRIMARY_FACES.map(face => (
            <div key={face} className="flex flex-col gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
              <span className="text-center text-xs font-bold text-slate-300">{face}</span>
              
              {/* CW */}
              <button
                onClick={() => onMoveClick(face as NotationMove)}
                disabled={disabled}
                className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all border border-slate-700 hover:border-blue-500 shadow-sm active:scale-95 disabled:opacity-50"
                title={`${face} Clockwise 90°`}
              >
                {face}
              </button>

              {/* CCW (Prime) */}
              <button
                onClick={() => onMoveClick(`${face}'` as NotationMove)}
                disabled={disabled}
                className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all border border-slate-700 hover:border-sky-500 shadow-sm active:scale-95 disabled:opacity-50"
                title={`${face} Counter-Clockwise 90°`}
              >
                {face}'
              </button>

              {/* Double 2 */}
              <button
                onClick={() => onMoveClick(`${face}2` as NotationMove)}
                disabled={disabled}
                className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all border border-slate-700 hover:border-indigo-500 shadow-sm active:scale-95 disabled:opacity-50"
                title={`${face} 180° Half Turn`}
              >
                {face}2
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          {SLICE_ROTATIONS.map(move => (
            <button
              key={move}
              onClick={() => onMoveClick(move)}
              disabled={disabled}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-mono text-xs font-bold transition-all border border-slate-700 hover:border-blue-500 shadow-sm active:scale-95 disabled:opacity-50"
            >
              {move}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

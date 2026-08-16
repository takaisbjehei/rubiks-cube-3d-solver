import React from 'react';
import { NotationMove } from '../../types/cube';
import { Shuffle, RotateCcw, Undo2, Redo2, Sparkles } from 'lucide-react';

interface MoveHistoryBarProps {
  history: NotationMove[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onScramble: () => void;
  onReset: () => void;
  onSolve: () => void;
  isSolved: boolean;
}

export const MoveHistoryBar: React.FC<MoveHistoryBarProps> = ({
  history,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onScramble,
  onReset,
  onSolve,
  isSolved,
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onScramble}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-900/30 flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Scramble
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo Move (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo Move (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Solve Virtual Cube CTA */}
        <button
          onClick={onSolve}
          disabled={isSolved}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${
            !isSolved
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:scale-105 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isSolved ? 'Cube is Solved' : 'Solve Virtual Cube'}
        </button>
      </div>

      {/* Move Tape */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          History ({history.length}):
        </span>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar w-full">
          {history.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No moves recorded yet</span>
          ) : (
            history.slice(-20).map((move, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs font-semibold shrink-0"
              >
                {move}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

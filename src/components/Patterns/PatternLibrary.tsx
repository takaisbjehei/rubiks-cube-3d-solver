import React from 'react';
import { CubePattern } from '../../types/cube';
import { POPULAR_PATTERNS } from '../../cube/patterns';
import { Sparkles, Play, Layers } from 'lucide-react';

interface PatternLibraryProps {
  onApplyPattern: (pattern: CubePattern) => void;
}

export const PatternLibrary: React.FC<PatternLibraryProps> = ({ onApplyPattern }) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-400" />
          Pattern Gallery
        </span>
        <span className="text-[11px] text-slate-500">1-click 3D generator</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {POPULAR_PATTERNS.map(pattern => (
          <div
            key={pattern.name}
            className="flex flex-col justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-blue-500/40 transition-all group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                  {pattern.name}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {pattern.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {pattern.description}
              </p>
              <div className="mt-2 p-1.5 rounded-lg bg-black/40 border border-slate-800/80 font-mono text-[10px] text-blue-400 truncate">
                {pattern.moves}
              </div>
            </div>

            <button
              onClick={() => onApplyPattern(pattern)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Play className="w-3 h-3" />
              Apply Pattern
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

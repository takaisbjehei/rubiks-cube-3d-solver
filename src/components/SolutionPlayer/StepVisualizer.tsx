import React from 'react';
import { SolutionStep, NotationMove } from '../../types/cube';
import { RotateCw, RotateCcw, RefreshCw, Compass } from 'lucide-react';

interface StepVisualizerProps {
  step: SolutionStep | null;
  currentStepIndex: number;
  totalSteps: number;
  onReplayMove?: () => void;
}

export const StepVisualizer: React.FC<StepVisualizerProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onReplayMove,
}) => {
  if (!step) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
        <p className="text-sm text-slate-400">No active step. Select or generate a solution to start.</p>
      </div>
    );
  }

  const isPrime = step.move.includes('\'');
  const isDouble = step.move.includes('2');

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl">
      {/* Top Step Counter & Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Move Hero Card */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-blue-500/20 shadow-inner">
        <div className="flex items-center gap-4">
          {/* Big Move Notation Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-black font-mono text-white shadow-lg shadow-blue-500/30 border border-blue-400/40">
            {step.move}
          </div>

          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              {step.faceName}
            </span>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
              {isDouble ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              ) : isPrime ? (
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {isDouble
                ? 'Turn 180° (Half turn)'
                : isPrime
                ? 'Counter-Clockwise 90°'
                : 'Clockwise 90°'}
            </span>
          </div>
        </div>

        {onReplayMove && (
          <button
            onClick={onReplayMove}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow hover:scale-105 active:scale-95"
            title="Replay 3D Move Animation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Human Physical Cube Instruction */}
      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/30 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
          <Compass className="w-4 h-4 text-blue-400" />
          Physical Cube Guide:
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {step.humanInstruction}
        </p>
        {step.tip && (
          <p className="text-[11px] text-slate-400 italic mt-0.5">
            💡 {step.tip}
          </p>
        )}
      </div>
    </div>
  );
};

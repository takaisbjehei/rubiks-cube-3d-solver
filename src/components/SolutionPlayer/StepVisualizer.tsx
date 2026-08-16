import React from 'react';
import { SolutionStep, NotationMove } from '../../types/cube';
import { RotateCw, RotateCcw, RefreshCw, Compass, Sparkles, CheckCircle2 } from 'lucide-react';

interface StepVisualizerProps {
  step: SolutionStep | null;
  currentStepIndex: number;
  totalSteps: number;
  onReplayMove?: () => void;
  onRestart?: () => void;
  isAllCompleted?: boolean;
}

export const StepVisualizer: React.FC<StepVisualizerProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onReplayMove,
  onRestart,
  isAllCompleted = false,
}) => {
  if (isAllCompleted || !step || currentStepIndex >= totalSteps) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white">Cube is 100% Solved!</h3>
          <p className="text-xs text-emerald-400/90 mt-1">
            All {totalSteps} solution steps have been performed.
          </p>
        </div>
        {onRestart && (
          <button
            onClick={onRestart}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Replay Solution
          </button>
        )}
      </div>
    );
  }

  const isPrime = step.move.includes('\'');
  const isDouble = step.move.includes('2');

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl">
      {/* Top Step Counter & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Next Move
          </span>
        </div>
        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIndex) / totalSteps) * 100}%` }}
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

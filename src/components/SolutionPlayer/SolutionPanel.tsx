import React, { useEffect, useRef } from 'react';
import { SolutionStep, NotationMove } from '../../types/cube';
import { StepVisualizer } from './StepVisualizer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Gauge,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

interface SolutionPanelProps {
  steps: SolutionStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onJumpToStep: (stepIndex: number) => void;
  onRestart: () => void;
  onSkipToEnd: () => void;
  onReplayMove: () => void;
  onChangeSpeed: (newSpeed: number) => void;
  isSolved: boolean;
}

const SPEED_OPTIONS = [0.5, 1.0, 1.5, 2.0];

export const SolutionPanel: React.FC<SolutionPanelProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  speed,
  onPlayPause,
  onNextStep,
  onPrevStep,
  onJumpToStep,
  onRestart,
  onSkipToEnd,
  onReplayMove,
  onChangeSpeed,
  isSolved,
}) => {
  const tapeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active move into view on the tape
  useEffect(() => {
    if (!tapeRef.current) return;
    const activeChip = tapeRef.current.children[currentStepIndex] as HTMLElement;
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentStepIndex]);

  const currentStep = steps[currentStepIndex] || null;

  return (
    <div className="flex flex-col gap-4">
      {/* Solved Banner if finished */}
      {isSolved && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/40 shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300">Cube Successfully Solved!</h4>
              <p className="text-xs text-emerald-400/80">
                Completed all {steps.length} moves in this solution.
              </p>
            </div>
          </div>
          <button
            onClick={onRestart}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow"
          >
            Replay Solution
          </button>
        </div>
      )}

      {/* Current Step Instruction Card */}
      <StepVisualizer
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        onReplayMove={onReplayMove}
      />

      {/* Main Playback Control Bar */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Controls
          </span>

          {/* Speed Preset Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
            {SPEED_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-all ${
                  speed === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={onRestart}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center shadow"
            title="Restart Solution (⏮)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevStep}
            disabled={currentStepIndex <= 0}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center shadow"
            title="Previous Move (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onPlayPause}
            className={`p-3 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
            title="Play / Pause Auto-Advance (Space)"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={onNextStep}
            disabled={currentStepIndex >= steps.length - 1}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center shadow"
            title="Next Move (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={onSkipToEnd}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center shadow"
            title="Skip to End (⏭)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full Algorithm Timeline / Clickable Step Chips */}
      <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Move Algorithm ({steps.length} total)
          </span>
          <span className="text-xs text-slate-500">Click any move to jump</span>
        </div>

        <div
          ref={tapeRef}
          className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth"
        >
          {steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isPassed = idx < currentStepIndex;

            return (
              <button
                key={idx}
                onClick={() => onJumpToStep(idx)}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-400/40'
                    : isPassed
                    ? 'bg-slate-800/80 text-slate-400 border-slate-700/50 hover:text-slate-200'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {step.move}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

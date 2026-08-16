import React, { useState, useEffect, useRef } from 'react';
import { SolveRecord } from '../../types/cube';
import { Timer, Trophy, Zap, Trash2, History } from 'lucide-react';

interface SpeedcubeTimerProps {
  currentMoves: number;
  isSolved: boolean;
  onSolveCompleted?: (record: SolveRecord) => void;
}

const STORAGE_KEY = 'rubiks_solver_history';

export const SpeedcubeTimer: React.FC<SpeedcubeTimerProps> = ({
  currentMoves,
  isSolved,
  onSolveCompleted,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [records, setRecords] = useState<SolveRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const movesAtStartRef = useRef<number>(0);

  // Start / Stop Timer
  const handleToggleTimer = () => {
    if (isRunning) {
      // Stop
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      // Start
      setIsRunning(true);
      startTimeRef.current = performance.now();
      movesAtStartRef.current = currentMoves;
      intervalRef.current = window.setInterval(() => {
        setElapsedMs(performance.now() - startTimeRef.current);
      }, 33);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsedMs(0);
  };

  // When cube becomes solved while running
  useEffect(() => {
    if (isRunning && isSolved) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const totalTime = elapsedMs;
      const totalMoves = Math.max(1, currentMoves - movesAtStartRef.current);
      const tps = Number((totalMoves / (totalTime / 1000)).toFixed(2));

      const newRecord: SolveRecord = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        timeMs: totalTime,
        moves: totalMoves,
        tps,
        scramble: 'Manual Virtual Solve',
      };

      const updated = [newRecord, ...records].slice(0, 50);
      setRecords(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      onSolveCompleted?.(newRecord);
    }
  }, [isSolved, isRunning, elapsedMs, currentMoves, records, onSolveCompleted]);

  const clearHistory = () => {
    setRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = ms / 1000;
    const minutes = Math.floor(totalSec / 60);
    const seconds = Math.floor(totalSec % 60);
    const hundredths = Math.floor((ms % 1000) / 10);
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
    }
    return `${seconds}.${hundredths.toString().padStart(2, '0')}s`;
  };

  // Best time
  const bestTime = records.length > 0 ? Math.min(...records.map(r => r.timeMs)) : null;
  // Current TPS
  const currentTPS = elapsedMs > 500 ? ((currentMoves - movesAtStartRef.current) / (elapsedMs / 1000)).toFixed(2) : '0.00';

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-blue-400" />
          Speedcube Timer
        </span>
        <button
          onClick={handleResetTimer}
          className="text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          Reset Timer
        </button>
      </div>

      {/* Main Timer Display */}
      <div
        onClick={handleToggleTimer}
        className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border ${
          isRunning
            ? 'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/30'
            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
        }`}
      >
        <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-100">
          {formatTime(elapsedMs)}
        </span>
        <span className="text-[11px] text-slate-500 mt-1">
          {isRunning ? 'Click or press Space to Stop' : 'Click or press Space to Start'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium">Moves</span>
          <span className="text-sm font-bold font-mono text-slate-200">{currentMoves}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
            <Zap className="w-3 h-3 text-amber-400" />
            TPS
          </span>
          <span className="text-sm font-bold font-mono text-amber-400">{currentTPS}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
            <Trophy className="w-3 h-3 text-emerald-400" />
            Best
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {bestTime !== null ? formatTime(bestTime) : '--'}
          </span>
        </div>
      </div>

      {/* Recent Solves Accordion / History */}
      {records.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <History className="w-3 h-3" />
              Recent Solves ({records.length})
            </span>
            <button
              onClick={clearHistory}
              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
            {records.slice(0, 5).map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/50"
              >
                <span className="font-mono font-bold text-slate-300">{formatTime(r.timeMs)}</span>
                <span className="text-[11px] text-slate-500 font-mono">{r.moves} moves ({r.tps} TPS)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

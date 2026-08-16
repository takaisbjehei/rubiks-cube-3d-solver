import React from 'react';
import { AppMode } from '../types/cube';
import { Box, PlaySquare, Scan, Layers, HelpCircle, Settings, Volume2, VolumeX, Camera, Sparkles } from 'lucide-react';

interface NavbarProps {
  mode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onOpenScanner: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasActiveSolution: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onSelectMode,
  onOpenHelp,
  onOpenSettings,
  onOpenScanner,
  soundEnabled,
  onToggleSound,
  hasActiveSolution,
}) => {
  return (
    <header className="w-full bg-[#0b0f19]/95 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center text-blue-400">
                <Box className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-sans">
                  RUBIK'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">STUDIO 3D</span>
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Interactive 3D Speedcube & Real-Time Real-Life Solver
              </p>
            </div>
          </div>

          {/* Quick Audio & Camera Actions on Mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={onOpenScanner}
              className="p-2 rounded-xl text-blue-400 hover:text-white bg-blue-950/60 border border-blue-800"
              title="Camera Cube Scanner"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              title="Help & Notation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Mode Pill Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800 shadow-inner max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectMode('virtual')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              mode === 'virtual'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Box className="w-4 h-4" />
            Virtual Cube
          </button>

          <button
            onClick={() => onSelectMode('input')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              mode === 'input'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Scan className="w-4 h-4 text-emerald-400" />
            <span>Solve My Real Cube</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <button
            onClick={() => onSelectMode('solver')}
            disabled={!hasActiveSolution}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
              mode === 'solver'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            Step Solver
          </button>

          <button
            onClick={() => onSelectMode('patterns')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              mode === 'patterns'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Patterns
          </button>
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 transition-all flex items-center gap-1.5 shadow-md shadow-blue-950/50 hover:scale-105 active:scale-95 cursor-pointer"
            title="Scan physical cube with Camera / Webcam"
          >
            <Camera className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Camera Scan
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title="Help & Notation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

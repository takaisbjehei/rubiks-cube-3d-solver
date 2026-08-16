import React, { useState } from 'react';
import { AppMode, CubeColor, Face } from './types/cube';
import { useCube } from './hooks/useCube';
import { useKeyboard } from './hooks/useKeyboard';
import { Navbar } from './components/Navbar';
import { CubeCanvas } from './components/Cube3D/CubeCanvas';
import { CubeNet } from './components/CubeInput/CubeNet';
import { ColorPicker } from './components/CubeInput/ColorPicker';
import { ValidationFeedback } from './components/CubeInput/ValidationFeedback';
import { SolutionPanel } from './components/SolutionPlayer/SolutionPanel';
import { VirtualKeypad } from './components/MoveControls/VirtualKeypad';
import { MoveHistoryBar } from './components/MoveControls/MoveHistoryBar';
import { SpeedcubeTimer } from './components/Timer/SpeedcubeTimer';
import { PatternLibrary } from './components/Patterns/PatternLibrary';
import { HelpModal } from './components/Modals/HelpModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { Sparkles, Box, Scan, Shuffle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<AppMode>('virtual');
  const [activePaintColor, setActivePaintColor] = useState<CubeColor>('white');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);

  const cube = useCube();

  // Keyboard navigation
  useKeyboard({
    onMove: move => {
      if (mode === 'virtual') cube.executeMove(move);
    },
    onUndo: cube.undo,
    onRedo: cube.redo,
    onScramble: () => cube.scramble(20),
    onSpace: () => {
      if (mode === 'solver') {
        cube.togglePlaySolution();
      }
    },
    onArrowLeft: () => {
      if (mode === 'solver') cube.stepBackward();
    },
    onArrowRight: () => {
      if (mode === 'solver') cube.stepForward();
    },
    disabled: isHelpOpen || isSettingsOpen,
  });

  // Handle generating solution from Input or Virtual mode
  const handleSolve = () => {
    const res = cube.solveCurrentCube();
    if (res.success && res.steps.length > 0) {
      setMode('solver');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Top Navbar */}
      <Navbar
        mode={mode}
        onSelectMode={setMode}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        soundEnabled={cube.soundEnabled}
        onToggleSound={() => cube.setSoundEnabled(!cube.soundEnabled)}
        hasActiveSolution={cube.solutionSteps.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-5">
        {/* Hero Banner (Shown when not in active step solver) */}
        {mode !== 'solver' && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-blue-950/40 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                  Speedcube Studio & Solver
                </span>
                {cube.isSolved && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Solve any 3×3 Rubik's Cube in 3D
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Match your real-world cube colors or play with the virtual 3D speedcube. Follow real-time animated step-by-step 3D solutions.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setMode('input')}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Scan className="w-4 h-4" />
                Match My Real Cube
              </button>

              <button
                onClick={() => {
                  setMode('virtual');
                  cube.scramble(20);
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Scramble Cube
              </button>
            </div>
          </div>
        )}

        {/* Workspace Grid: 3D Viewport on Left/Center, Controls on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* 3D Cube Canvas (Column 1-7 on desktop) */}
          <div className="lg:col-span-7 h-[420px] sm:h-[500px] lg:h-[580px] w-full sticky top-20">
            <CubeCanvas
              facelets={cube.facelets}
              onMoveExecuted={move => cube.executeMove(move, true)}
              onFaceletClicked={idx => {
                if (mode === 'input') {
                  cube.paintSticker(idx, activePaintColor);
                }
              }}
              activeFaceHighlight={cube.activeFaceHighlight}
              activeMoveArrow={cube.activeMoveArrow}
              isPaintingMode={mode === 'input'}
              activePaintColor={activePaintColor}
              animationSpeed={cube.animationSpeed}
              triggerMoveRef={cube.triggerMoveRef}
              resetViewTrigger={resetViewTrigger}
            />
          </div>

          {/* Contextual Control Panels (Column 8-12 on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Mode 1: Physical Cube Input Mode ("Solve My Real Cube") */}
            {mode === 'input' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Instructions banner */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Scan className="w-4 h-4 text-emerald-400" />
                      Physical Cube Color Input
                    </h3>
                    <button
                      onClick={cube.resetCube}
                      className="text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      Reset to Solved
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Pick a color and click stickers on the 2D net below or click directly on the 3D cube.
                  </p>
                </div>

                {/* Color Picker Palette */}
                <ColorPicker
                  activeColor={activePaintColor}
                  onSelectColor={setActivePaintColor}
                  counts={cube.validation.counts}
                />

                {/* 2D Unfolded Net */}
                <CubeNet
                  facelets={cube.facelets}
                  activeColor={activePaintColor}
                  onStickerClick={idx => cube.paintSticker(idx, activePaintColor)}
                  onFillFace={(face, color) => cube.fillFace(face, color)}
                />

                {/* Parity & Validity Diagnostic Banner */}
                <ValidationFeedback
                  validation={cube.validation}
                  onSolveClick={handleSolve}
                  isSolving={cube.isSolving}
                />
              </div>
            )}

            {/* Mode 2: Step-by-Step Solver Mode */}
            {mode === 'solver' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <SolutionPanel
                  steps={cube.solutionSteps}
                  currentStepIndex={cube.currentStepIndex}
                  isPlaying={cube.isPlayingSolution}
                  speed={cube.animationSpeed}
                  onPlayPause={cube.togglePlaySolution}
                  onNextStep={cube.stepForward}
                  onPrevStep={cube.stepBackward}
                  onJumpToStep={cube.jumpToStep}
                  onRestart={cube.restartSolution}
                  onSkipToEnd={() => cube.jumpToStep(cube.solutionSteps.length)}
                  onReplayMove={cube.replayCurrentMove}
                  onChangeSpeed={cube.setAnimationSpeed}
                  isSolved={cube.isSolved && cube.currentStepIndex >= cube.solutionSteps.length}
                />
              </div>
            )}

            {/* Mode 3: Virtual Speedcube Play Mode */}
            {mode === 'virtual' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Move Controls Toolbar */}
                <MoveHistoryBar
                  history={cube.history}
                  canUndo={cube.canUndo}
                  canRedo={cube.canRedo}
                  onUndo={cube.undo}
                  onRedo={cube.redo}
                  onScramble={() => cube.scramble(20)}
                  onReset={cube.resetCube}
                  onSolve={handleSolve}
                  isSolved={cube.isSolved}
                />

                {/* Virtual Keypad */}
                <VirtualKeypad onMoveClick={move => cube.executeMove(move, true)} />

                {/* Speedcube Timer & Records */}
                <SpeedcubeTimer
                  currentMoves={cube.history.length}
                  isSolved={cube.isSolved}
                />
              </div>
            )}

            {/* Mode 4: Pattern Gallery */}
            {mode === 'patterns' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <PatternLibrary
                  onApplyPattern={pattern => {
                    cube.applyPattern(pattern);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={cube.soundEnabled}
        onToggleSound={cube.setSoundEnabled}
        soundVolume={cube.soundVolume}
        onChangeVolume={cube.setSoundVolume}
        defaultSpeed={cube.animationSpeed}
        onChangeDefaultSpeed={cube.setAnimationSpeed}
      />
    </div>
  );
}

export default App;

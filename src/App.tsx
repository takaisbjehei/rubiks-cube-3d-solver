import React, { useState, useCallback } from 'react';
import { AppMode, CubeColor, FaceletArray } from './types/cube';
import { useCube } from './hooks/useCube';
import { useKeyboard } from './hooks/useKeyboard';
import { Navbar } from './components/Navbar';
import { CubeCanvas } from './components/Cube3D/CubeCanvas';
import { ColorPicker } from './components/CubeInput/ColorPicker';
import { CubeNet } from './components/CubeInput/CubeNet';
import { ValidationFeedback } from './components/CubeInput/ValidationFeedback';
import { VirtualKeypad } from './components/MoveControls/VirtualKeypad';
import { MoveHistoryBar } from './components/MoveControls/MoveHistoryBar';
import { SolutionPanel } from './components/SolutionPlayer/SolutionPanel';
import { PatternLibrary } from './components/Patterns/PatternLibrary';
import { SpeedcubeTimer } from './components/Timer/SpeedcubeTimer';
import { HelpModal } from './components/Modals/HelpModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { CameraScannerModal } from './components/CameraScanner/CameraScannerModal';
import { Scan, Sparkles, AlertCircle, Camera } from 'lucide-react';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('virtual');
  const [activePaintColor, setActivePaintColor] = useState<CubeColor>('white');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

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
  });

  // Solve Action
  const handleSolve = useCallback(() => {
    const res = cube.solveCurrentCube();
    if (res.success && res.steps.length > 0) {
      setMode('solver');
    }
  }, [cube]);

  // Apply Facelets from Camera Scanner
  const handleApplyScannedFacelets = useCallback(
    (scanned: FaceletArray) => {
      cube.setFacelets(scanned);
      cube.setHistory([]);
      cube.setRedoStack([]);
      setMode('input');

      // Attempt solve
      const res = cube.solveCurrentCube();
      if (res.success && res.steps.length > 0) {
        setMode('solver');
      }
    },
    [cube]
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        mode={mode}
        onSelectMode={setMode}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScanner={() => setIsCameraModalOpen(true)}
        soundEnabled={cube.soundEnabled}
        onToggleSound={() => cube.setSoundEnabled(!cube.soundEnabled)}
        hasActiveSolution={cube.solutionSteps.length > 0}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-6">
        {/* Error Alert Banner if Solver Failed */}
        {cube.solverError && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 flex items-start gap-3 shadow-xl animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-100">Cube Unsolvable in Current State</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{cube.solverError}</p>
            </div>
            <button
              onClick={() => setMode('input')}
              className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fix in IRL Net
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 3D WebGL Speedcube Canvas (Column 1-7 on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <CubeCanvas
              facelets={cube.facelets}
              activeFaceHighlight={cube.activeFaceHighlight}
              activeMoveArrow={cube.activeMoveArrow}
              isPaintingMode={mode === 'input'}
              activePaintColor={activePaintColor}
              onFaceletClicked={index => {
                if (mode === 'input') {
                  cube.paintSticker(index, activePaintColor);
                }
              }}
              onMoveExecuted={move => {
                if (mode === 'virtual') {
                  cube.executeMove(move, true);
                }
              }}
              triggerMoveRef={cube.triggerMoveRef}
              animationSpeed={cube.animationSpeed}
            />

            {/* Quick Helper Subtitle */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Left Drag: Free 3D Orbit • Scroll: Zoom
              </span>
              <span>WCA Western Standard Colors</span>
            </div>
          </div>

          {/* Contextual Control Panels (Column 8-12 on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Mode 1: Physical Cube Input Mode ("Solve My Real Cube") */}
            {mode === 'input' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Instructions & Camera Scan Banner */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Scan className="w-4 h-4 text-emerald-400" />
                      Physical Cube Color Input
                    </h3>
                    <button
                      onClick={cube.resetCube}
                      className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Reset to Solved
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pick a color and click stickers on the 2D net, click the 3D cube directly, or use your webcam.
                  </p>

                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Camera className="w-4 h-4 animate-pulse" />
                    Scan Physical Cube with Camera
                  </button>
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
                  isCubeSolved={cube.isSolved}
                  moveCount={cube.history.length}
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
        animationSpeed={cube.animationSpeed}
        onChangeSpeed={cube.setAnimationSpeed}
        soundEnabled={cube.soundEnabled}
        onToggleSound={() => cube.setSoundEnabled(!cube.soundEnabled)}
        soundVolume={cube.soundVolume}
        onChangeVolume={cube.setSoundVolume}
      />
      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onApplyScannedFacelets={handleApplyScannedFacelets}
      />
    </div>
  );
};

export default App;

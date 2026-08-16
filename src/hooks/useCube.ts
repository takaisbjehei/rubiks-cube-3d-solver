import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FaceletArray,
  NotationMove,
  Face,
  CubeColor,
  SolutionStep,
  ValidationDetail,
  CubePattern,
} from '../types/cube';
import { SOLVED_FACELETS, CENTER_INDICES, FACE_BASE_INDICES } from '../cube/constants';
import { applyMoveToFacelets, invertMove, parseMoves } from '../cube/moves';
import { validateCubeState, isCubeSolved } from '../cube/validation';
import { solveRubiksCube, SolverResult } from '../cube/solver';
import { generateScrambleMoves } from '../cube/scramble';
import { soundEffects } from '../cube/audio';
import confetti from 'canvas-confetti';

export function useCube() {
  const [facelets, setFacelets] = useState<FaceletArray>([...SOLVED_FACELETS]);
  const [history, setHistory] = useState<NotationMove[]>([]);
  const [redoStack, setRedoStack] = useState<NotationMove[]>([]);

  // Solution State
  const [solutionSteps, setSolutionSteps] = useState<SolutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlayingSolution, setIsPlayingSolution] = useState<boolean>(false);
  const [solutionInitialFacelets, setSolutionInitialFacelets] = useState<FaceletArray | null>(null);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solverError, setSolverError] = useState<string | null>(null);

  // Active Highlight & Arrow
  const [activeFaceHighlight, setActiveFaceHighlight] = useState<Face | null>(null);
  const [activeMoveArrow, setActiveMoveArrow] = useState<NotationMove | null>(null);

  // Settings
  const [animationSpeed, setAnimationSpeed] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(0.4);

  // Move trigger ref to communicate with 3D canvas
  const triggerMoveRef = useRef<((move: NotationMove, speed?: number) => Promise<void>) | null>(null);
  const playIntervalRef = useRef<number | null>(null);

  // Live validation
  const validation: ValidationDetail = validateCubeState(facelets);
  const isSolved = isCubeSolved(facelets);

  // Execute a logical move + optionally animate
  const executeMove = useCallback(async (move: NotationMove, recordHistory = true) => {
    // 1. Animate visually if 3D canvas is attached
    if (triggerMoveRef.current) {
      await triggerMoveRef.current(move, animationSpeed);
    } else {
      soundEffects.playTurn(move.includes('2'), move.includes('\''));
    }

    // 2. Update logical facelets
    setFacelets(prev => {
      const next = applyMoveToFacelets(prev, move);
      if (isCubeSolved(next)) {
        soundEffects.playSolvedFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ffffff'],
        });
      }
      return next;
    });

    if (recordHistory) {
      setHistory(prev => [...prev, move]);
      setRedoStack([]);
    }
  }, [animationSpeed]);

  // Undo
  const undo = useCallback(async () => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];
    const inv = invertMove(lastMove);

    setHistory(prev => prev.slice(0, -1));
    setRedoStack(prev => [lastMove, ...prev]);

    if (triggerMoveRef.current) {
      await triggerMoveRef.current(inv, animationSpeed);
    }
    setFacelets(prev => applyMoveToFacelets(prev, inv));
  }, [history, animationSpeed]);

  // Redo
  const redo = useCallback(async () => {
    if (redoStack.length === 0) return;
    const nextMove = redoStack[0];
    setRedoStack(prev => prev.slice(1));
    setHistory(prev => [...prev, nextMove]);

    if (triggerMoveRef.current) {
      await triggerMoveRef.current(nextMove, animationSpeed);
    }
    setFacelets(prev => applyMoveToFacelets(prev, nextMove));
  }, [redoStack, animationSpeed]);

  // Scramble
  const scramble = useCallback(async (length = 20) => {
    const scrambleMoves = generateScrambleMoves(length);
    let current = [...SOLVED_FACELETS];

    for (const m of scrambleMoves) {
      current = applyMoveToFacelets(current, m);
    }

    setFacelets(current);
    setHistory(scrambleMoves);
    setRedoStack([]);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    setIsPlayingSolution(false);
    setActiveFaceHighlight(null);
    setActiveMoveArrow(null);
    soundEffects.playTurn(false, false);
  }, []);

  // Reset to Solved
  const resetCube = useCallback(() => {
    setFacelets([...SOLVED_FACELETS]);
    setHistory([]);
    setRedoStack([]);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    setIsPlayingSolution(false);
    setActiveFaceHighlight(null);
    setActiveMoveArrow(null);
    setSolverError(null);
  }, []);

  // Paint single sticker
  const paintSticker = useCallback((index: number, color: CubeColor) => {
    // Prevent changing fixed centers
    const isCenter = Object.values(CENTER_INDICES).includes(index);
    if (isCenter) return;

    setFacelets(prev => {
      const next = [...prev];
      next[index] = color;
      return next;
    });
    setHistory([]);
    setRedoStack([]);
    setSolutionSteps([]);
    soundEffects.playTurn();
  }, []);

  // Fill entire face with color
  const fillFace = useCallback((face: Face, color: CubeColor) => {
    const base = FACE_BASE_INDICES[face];
    const centerIdx = CENTER_INDICES[face];
    setFacelets(prev => {
      const next = [...prev];
      for (let i = 0; i < 9; i++) {
        if (base + i !== centerIdx) {
          next[base + i] = color;
        }
      }
      return next;
    });
    soundEffects.playTurn();
  }, []);

  // Calculate Solution from current state
  const solveCurrentCube = useCallback((): SolverResult => {
    setIsSolving(true);
    setSolverError(null);
    const res = solveRubiksCube(facelets);
    setIsSolving(false);

    if (res.success && res.steps.length > 0) {
      setSolutionSteps(res.steps);
      setCurrentStepIndex(0);
      setSolutionInitialFacelets([...facelets]);
      setActiveMoveArrow(res.steps[0].move);
      setActiveFaceHighlight(res.steps[0].face as Face);
    } else if (!res.success && res.error) {
      setSolverError(res.error);
    }

    return res;
  }, [facelets]);

  // Step Forward in Solution
  const stepForward = useCallback(async () => {
    if (solutionSteps.length === 0 || currentStepIndex >= solutionSteps.length) return;
    const step = solutionSteps[currentStepIndex];

    await executeMove(step.move, false);

    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);

    if (nextIndex < solutionSteps.length) {
      const nextStep = solutionSteps[nextIndex];
      setActiveMoveArrow(nextStep.move);
      setActiveFaceHighlight(nextStep.face as Face);
    } else {
      setActiveMoveArrow(null);
      setActiveFaceHighlight(null);
      setIsPlayingSolution(false);
    }
  }, [solutionSteps, currentStepIndex, executeMove]);

  // Step Backward in Solution
  const stepBackward = useCallback(async () => {
    if (solutionSteps.length === 0 || currentStepIndex <= 0) return;
    const prevIndex = currentStepIndex - 1;
    const step = solutionSteps[prevIndex];
    const inv = invertMove(step.move);

    if (triggerMoveRef.current) {
      await triggerMoveRef.current(inv, animationSpeed);
    }
    setFacelets(prev => applyMoveToFacelets(prev, inv));
    setCurrentStepIndex(prevIndex);

    const currentStep = solutionSteps[prevIndex];
    setActiveMoveArrow(currentStep.move);
    setActiveFaceHighlight(currentStep.face as Face);
  }, [solutionSteps, currentStepIndex, animationSpeed]);

  // Jump to specific step
  const jumpToStep = useCallback((targetIndex: number) => {
    if (solutionSteps.length === 0 || !solutionInitialFacelets) return;
    const bounded = Math.max(0, Math.min(solutionSteps.length, targetIndex));

    let state = [...solutionInitialFacelets];
    for (let i = 0; i < bounded; i++) {
      state = applyMoveToFacelets(state, solutionSteps[i].move);
    }

    setFacelets(state);
    setCurrentStepIndex(bounded);

    if (bounded < solutionSteps.length) {
      const s = solutionSteps[bounded];
      setActiveMoveArrow(s.move);
      setActiveFaceHighlight(s.face as Face);
    } else {
      setActiveMoveArrow(null);
      setActiveFaceHighlight(null);
    }
  }, [solutionSteps, solutionInitialFacelets]);

  // Restart Solution
  const restartSolution = useCallback(() => {
    if (solutionInitialFacelets) {
      setFacelets([...solutionInitialFacelets]);
      setCurrentStepIndex(0);
      if (solutionSteps.length > 0) {
        setActiveMoveArrow(solutionSteps[0].move);
        setActiveFaceHighlight(solutionSteps[0].face as Face);
      }
    }
  }, [solutionInitialFacelets, solutionSteps]);

  // Replay current move
  const replayCurrentMove = useCallback(async () => {
    if (solutionSteps.length === 0 || currentStepIndex >= solutionSteps.length) return;
    const step = solutionSteps[currentStepIndex];
    if (triggerMoveRef.current) {
      await triggerMoveRef.current(step.move, animationSpeed);
    }
  }, [solutionSteps, currentStepIndex, animationSpeed]);

  // Apply Pattern
  const applyPattern = useCallback(async (pattern: CubePattern) => {
    const moves = parseMoves(pattern.moves);
    let current = [...SOLVED_FACELETS];
    for (const m of moves) {
      current = applyMoveToFacelets(current, m);
    }
    setFacelets(current);
    setHistory(moves);
    setRedoStack([]);
    setSolutionSteps([]);
    setCurrentStepIndex(0);
    soundEffects.playTurn(true, false);
  }, []);

  // Auto-play solution timer
  useEffect(() => {
    if (isPlayingSolution) {
      const intervalDelay = Math.max(600, Math.round(1100 / animationSpeed));
      playIntervalRef.current = window.setInterval(() => {
        if (currentStepIndex < solutionSteps.length) {
          stepForward();
        } else {
          setIsPlayingSolution(false);
        }
      }, intervalDelay);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlayingSolution, currentStepIndex, solutionSteps.length, animationSpeed, stepForward]);

  return {
    facelets,
    setFacelets,
    history,
    redoStack,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    solutionSteps,
    currentStepIndex,
    isPlayingSolution,
    isSolving,
    solverError,
    activeFaceHighlight,
    activeMoveArrow,
    animationSpeed,
    soundEnabled,
    soundVolume,
    validation,
    isSolved,
    triggerMoveRef,
    executeMove,
    undo,
    redo,
    scramble,
    resetCube,
    paintSticker,
    fillFace,
    solveCurrentCube,
    stepForward,
    stepBackward,
    jumpToStep,
    restartSolution,
    replayCurrentMove,
    applyPattern,
    setAnimationSpeed,
    setSoundEnabled,
    setSoundVolume,
    setIsPlayingSolution,
  };
}

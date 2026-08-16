import { useEffect } from 'react';
import { NotationMove } from '../types/cube';

interface UseKeyboardOptions {
  onMove: (move: NotationMove) => void;
  onUndo: () => void;
  onRedo: () => void;
  onScramble: () => void;
  onSpace: () => void;
  onArrowLeft: () => void;
  onArrowRight: () => void;
  disabled?: boolean;
}

export function useKeyboard({
  onMove,
  onUndo,
  onRedo,
  onScramble,
  onSpace,
  onArrowLeft,
  onArrowRight,
  disabled = false,
}: UseKeyboardOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input elements
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        onRedo();
        return;
      }

      // Spacebar
      if (e.code === 'Space') {
        e.preventDefault();
        onSpace();
        return;
      }

      // Arrow keys
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onArrowLeft();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onArrowRight();
        return;
      }

      // Scramble
      if (e.key.toLowerCase() === 's' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onScramble();
        return;
      }

      // Primary Face Turns (U, D, L, R, F, B)
      const key = e.key.toUpperCase();
      if (['U', 'D', 'L', 'R', 'F', 'B', 'M', 'E', 'S', 'X', 'Y', 'Z'].includes(key)) {
        e.preventDefault();
        const move = e.shiftKey ? (`${key}'` as NotationMove) : (key as NotationMove);
        onMove(move);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onUndo, onRedo, onScramble, onSpace, onArrowLeft, onArrowRight, disabled]);
}

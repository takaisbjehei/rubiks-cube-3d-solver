import min2phase from 'min2phase.js';
import { FaceletArray, NotationMove, SolutionStep } from '../../types/cube';
import { getMoveDetails, parseMoves, applyMoveToFacelets } from '../moves';
import { validateCubeState, isCubeSolved } from '../validation';
import { CENTER_INDICES } from '../constants';

let isMin2PhaseInitialized = false;

function ensureInitialized() {
  if (!isMin2PhaseInitialized) {
    try {
      min2phase.initFull();
      isMin2PhaseInitialized = true;
    } catch (err) {
      console.warn('min2phase init warning:', err);
    }
  }
}

export interface SolverResult {
  success: boolean;
  isSolvedAlready: boolean;
  moves: NotationMove[];
  algorithmString: string;
  steps: SolutionStep[];
  moveCount: number;
  estimatedTimeSec: number;
  error?: string;
}

/**
 * Convert 54-facelet array into the standard 54-char string UUU...RRR...FFF...DDD...LLL...BBB
 */
export function faceletsToKociembaString(facelets: FaceletArray): string {
  const colorToFace: Record<string, string> = {
    [facelets[CENTER_INDICES.U]]: 'U',
    [facelets[CENTER_INDICES.R]]: 'R',
    [facelets[CENTER_INDICES.F]]: 'F',
    [facelets[CENTER_INDICES.D]]: 'D',
    [facelets[CENTER_INDICES.L]]: 'L',
    [facelets[CENTER_INDICES.B]]: 'B',
  };
  return facelets.map(c => colorToFace[c] || 'U').join('');
}

/**
 * Solve a 3x3 Rubik's Cube from any valid 54-facelet state
 */
export function solveRubiksCube(facelets: FaceletArray): SolverResult {
  // 1. Check if already solved
  if (isCubeSolved(facelets)) {
    return {
      success: true,
      isSolvedAlready: true,
      moves: [],
      algorithmString: '',
      steps: [],
      moveCount: 0,
      estimatedTimeSec: 0,
    };
  }

  // 2. Validate physical possibility
  const validation = validateCubeState(facelets);
  if (!validation.isValid) {
    return {
      success: false,
      isSolvedAlready: false,
      moves: [],
      algorithmString: '',
      steps: [],
      moveCount: 0,
      estimatedTimeSec: 0,
      error: validation.errors.join(' • '),
    };
  }

  // 3. Solve with Two-Phase Kociemba engine
  try {
    ensureInitialized();
    const faceString = faceletsToKociembaString(facelets);
    const solutionStr = min2phase.solve(faceString);

    if (solutionStr && typeof solutionStr === 'string' && !solutionStr.startsWith('Error')) {
      const moves = parseMoves(solutionStr);
      
      // Verify solution solves the cube
      let verifyState = [...facelets];
      for (const m of moves) {
        verifyState = applyMoveToFacelets(verifyState, m);
      }

      if (isCubeSolved(verifyState)) {
        const steps = moves.map((m, idx) => getMoveDetails(m, idx));
        return {
          success: true,
          isSolvedAlready: false,
          moves,
          algorithmString: moves.join(' '),
          steps,
          moveCount: moves.length,
          estimatedTimeSec: Math.ceil(moves.length * 0.9),
        };
      }
    }
  } catch (err: any) {
    console.error('Solver execution error:', err);
  }

  return {
    success: false,
    isSolvedAlready: false,
    moves: [],
    algorithmString: '',
    steps: [],
    moveCount: 0,
    estimatedTimeSec: 0,
    error: 'Could not compute a valid solution for this configuration. Please check the painted stickers.',
  };
}

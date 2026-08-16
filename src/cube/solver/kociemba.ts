import { FaceletArray, NotationMove } from '../../types/cube';
import { applyMoveToFacelets, parseMoves } from '../moves';
import { isCubeSolved } from '../validation';
import { faceletsToCubieCube, MOVE_NAMES, MOVE_CUBIES, CubieCube, N_TWIST, N_FLIP, N_SLICE1 } from './coordCube';
import {
  initSolverTables,
  twistMoveTable,
  flipMoveTable,
  sliceMoveTable,
  sliceTwistPrune,
  sliceFlipPrune,
} from './tables';

// Phase 2 allowed moves in G1: U(0), U2(1), U'(2), R2(4), F2(7), D(9), D2(10), D'(11), L2(13), B2(16)
const P2_MOVE_INDICES = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];

/**
 * Solve a 3x3 Rubik's Cube using Kociemba Two-Phase IDA* Search
 */
export function solveKociemba(facelets: FaceletArray, maxDepth = 24, timeoutMs = 1200): NotationMove[] | null {
  if (isCubeSolved(facelets)) return [];

  initSolverTables();

  const cc = faceletsToCubieCube(facelets);
  const twist = cc.getTwist();
  const flip = cc.getFlip();
  const slice = cc.getSlice();

  const startTime = Date.now();
  let bestSolution: number[] | null = null;

  // Phase 1 IDA* Search
  for (let depth1 = 0; depth1 <= 12; depth1++) {
    const p1Moves: number[] = [];
    const found = searchPhase1(twist, flip, slice, depth1, 0, -1, p1Moves, cc, maxDepth, startTime, timeoutMs);
    if (found) {
      bestSolution = found;
      break;
    }
    if (Date.now() - startTime > timeoutMs) break;
  }

  if (!bestSolution) return null;

  const notationMoves: NotationMove[] = bestSolution.map(m => MOVE_NAMES[m]);
  return simplifyMoveSequence(notationMoves);
}

function searchPhase1(
  twist: number,
  flip: number,
  slice: number,
  maxDepth: number,
  currentDepth: number,
  lastFace: number,
  p1Moves: number[],
  initialCC: CubieCube,
  globalMaxDepth: number,
  startTime: number,
  timeoutMs: number
): number[] | null {
  if (Date.now() - startTime > timeoutMs) return null;

  // Heuristic lower bound from pruning tables
  const hTwist = sliceTwistPrune[slice * N_TWIST + twist];
  const hFlip = sliceFlipPrune[slice * N_FLIP + flip];
  const h1 = Math.max(hTwist >= 0 ? hTwist : 0, hFlip >= 0 ? hFlip : 0);

  if (h1 > maxDepth - currentDepth) return null;

  if (currentDepth === maxDepth) {
    if (twist === 0 && flip === 0 && slice === 0) {
      // Reached subgroup G1! Apply Phase 1 moves to initial cube
      let phase1CC = initialCC.clone();
      for (const m of p1Moves) {
        phase1CC = phase1CC.multiply(MOVE_CUBIES[m]);
      }

      // Solve Phase 2 using bidirectional / IDA* search
      const p2Max = Math.min(14, globalMaxDepth - maxDepth);
      for (let depth2 = 0; depth2 <= p2Max; depth2++) {
        const p2Moves: number[] = [];
        const sol = searchPhase2IDA(phase1CC, depth2, 0, -1, p2Moves, startTime, timeoutMs);
        if (sol) {
          return [...p1Moves, ...sol];
        }
      }
    }
    return null;
  }

  for (let m = 0; m < 18; m++) {
    const face = Math.floor(m / 3);
    if (face === lastFace) continue;
    if (face === lastFace - 3) continue;

    const nextTwist = twistMoveTable[twist][m];
    const nextFlip = flipMoveTable[flip][m];
    const nextSlice = sliceMoveTable[slice][m];

    p1Moves.push(m);
    const res = searchPhase1(
      nextTwist,
      nextFlip,
      nextSlice,
      maxDepth,
      currentDepth + 1,
      face,
      p1Moves,
      initialCC,
      globalMaxDepth,
      startTime,
      timeoutMs
    );
    if (res) return res;
    p1Moves.pop();
  }

  return null;
}

// Phase 2 IDA* with corner & edge permutation distance
function searchPhase2IDA(
  cc: CubieCube,
  maxDepth: number,
  currentDepth: number,
  lastFace: number,
  p2Moves: number[],
  startTime: number,
  timeoutMs: number
): number[] | null {
  if (Date.now() - startTime > timeoutMs) return null;

  const cp = cc.getCPerm();
  const ep = cc.getEPerm();
  const ss = cc.getSliceSorted();

  if (cp === 0 && ep === 0 && ss === 0) {
    return [...p2Moves];
  }

  if (currentDepth === maxDepth) {
    return null;
  }

  // Fast Phase 2 branch pruning: simple mismatch count heuristic
  let cornerMismatches = 0;
  for (let i = 0; i < 8; i++) {
    if (cc.cp[i] !== i) cornerMismatches++;
  }
  let edgeMismatches = 0;
  for (let i = 0; i < 12; i++) {
    if (cc.ep[i] !== i) edgeMismatches++;
  }
  const h2 = Math.max(Math.ceil(cornerMismatches / 4), Math.ceil(edgeMismatches / 4));
  if (h2 > maxDepth - currentDepth) return null;

  for (const m of P2_MOVE_INDICES) {
    const face = Math.floor(m / 3);
    if (face === lastFace) continue;
    if (face === lastFace - 3) continue;

    const nextCC = cc.multiply(MOVE_CUBIES[m]);
    p2Moves.push(m);
    const res = searchPhase2IDA(nextCC, maxDepth, currentDepth + 1, face, p2Moves, startTime, timeoutMs);
    if (res) return res;
    p2Moves.pop();
  }

  return null;
}

/**
 * Simplify consecutive moves on the same face: e.g. R R -> R2, R R' -> (empty), R2 R2 -> (empty)
 */
export function simplifyMoveSequence(moves: NotationMove[]): NotationMove[] {
  if (!moves || moves.length === 0) return [];
  const result: NotationMove[] = [];

  const turnValue: Record<string, number> = {
    '': 1,
    '2': 2,
    '\'': 3,
  };

  const valToMod: Record<number, string> = {
    1: '',
    2: '2',
    3: '\'',
  };

  for (const move of moves) {
    const face = move[0];
    const mod = move.slice(1);
    const val = turnValue[mod] || 1;

    if (result.length > 0) {
      const lastMove = result[result.length - 1];
      const lastFace = lastMove[0];
      const lastMod = lastMove.slice(1);
      const lastVal = turnValue[lastMod] || 1;

      if (lastFace === face) {
        result.pop();
        const combined = (lastVal + val) % 4;
        if (combined > 0) {
          result.push(`${face}${valToMod[combined]}` as NotationMove);
        }
        continue;
      }
    }
    result.push(move);
  }

  return result;
}

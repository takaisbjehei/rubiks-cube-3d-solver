import { Face, NotationMove, SolutionStep, FaceletArray } from '../types/cube';

// 54-facelet permutations for base Clockwise moves (U, D, R, L, F, B)
export const BASE_PERMUTATIONS: Record<Face, number[]> = {
  U: [
    6, 3, 0, 7, 4, 1, 8, 5, 2,
    45, 46, 47, 12, 13, 14, 15, 16, 17,
    9, 10, 11, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31, 32, 33, 34, 35,
    18, 19, 20, 39, 40, 41, 42, 43, 44,
    36, 37, 38, 48, 49, 50, 51, 52, 53,
  ],
  D: [
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 24, 25, 26,
    18, 19, 20, 21, 22, 23, 42, 43, 44,
    33, 30, 27, 34, 31, 28, 35, 32, 29,
    36, 37, 38, 39, 40, 41, 51, 52, 53,
    45, 46, 47, 48, 49, 50, 15, 16, 17,
  ],
  R: [
    0, 1, 20, 3, 4, 23, 6, 7, 26,
    15, 12, 9, 16, 13, 10, 17, 14, 11,
    18, 19, 29, 21, 22, 32, 24, 25, 35,
    27, 28, 51, 30, 31, 48, 33, 34, 45,
    36, 37, 38, 39, 40, 41, 42, 43, 44,
    8, 46, 47, 5, 49, 50, 2, 52, 53,
  ],
  L: [
    53, 1, 2, 50, 4, 5, 47, 7, 8,
    9, 10, 11, 12, 13, 14, 15, 16, 17,
    0, 19, 20, 3, 22, 23, 6, 25, 26,
    18, 28, 29, 21, 31, 32, 24, 34, 35,
    42, 39, 36, 43, 40, 37, 44, 41, 38,
    45, 46, 33, 48, 49, 30, 51, 52, 27,
  ],
  F: [
    0, 1, 2, 3, 4, 5, 44, 41, 38,
    6, 10, 11, 7, 13, 14, 8, 16, 17,
    24, 21, 18, 25, 22, 19, 26, 23, 20,
    15, 12, 9, 30, 31, 32, 33, 34, 35,
    36, 37, 27, 39, 40, 28, 42, 43, 29,
    45, 46, 47, 48, 49, 50, 51, 52, 53,
  ],
  B: [
    11, 14, 17, 3, 4, 5, 6, 7, 8,
    9, 10, 35, 12, 13, 34, 15, 16, 33,
    18, 19, 20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31, 32, 36, 39, 42,
    2, 37, 38, 1, 40, 41, 0, 43, 44,
    51, 48, 45, 52, 49, 46, 53, 50, 47,
  ],
};

function applyPerm(state: FaceletArray, perm: number[]): FaceletArray {
  const next: FaceletArray = new Array(54);
  for (let i = 0; i < 54; i++) {
    next[i] = state[perm[i]];
  }
  return next;
}

// Slice moves:
// M: slice x = 0 in L direction
function applyM(state: FaceletArray): FaceletArray {
  const next = [...state];
  // 4-cycles for middle slice
  // U center(4) -> F center(22) -> D center(31) -> B center(49) -> U(4)
  // U top(1), bot(7) etc.
  const a = [1, 4, 7];
  const b = [19, 22, 25];
  const c = [28, 31, 34];
  const d = [52, 49, 46]; // B face reversed
  const temp = a.map(i => state[i]);
  for (let i = 0; i < 3; i++) {
    next[a[i]] = state[d[i]];
    next[d[i]] = state[c[i]];
    next[c[i]] = state[b[i]];
    next[b[i]] = temp[i];
  }
  return next;
}

// E: slice y = 0 in D direction
function applyE(state: FaceletArray): FaceletArray {
  const next = [...state];
  const a = [21, 22, 23]; // F mid row
  const b = [12, 13, 14]; // R mid row
  const c = [48, 49, 50]; // B mid row
  const d = [39, 40, 41]; // L mid row
  const temp = a.map(i => state[i]);
  for (let i = 0; i < 3; i++) {
    next[a[i]] = state[d[i]];
    next[d[i]] = state[c[i]];
    next[c[i]] = state[b[i]];
    next[b[i]] = temp[i];
  }
  return next;
}

// S: slice z = 0 in F direction
function applyS(state: FaceletArray): FaceletArray {
  const next = [...state];
  const a = [3, 4, 5];    // U mid row
  const b = [10, 13, 16]; // R mid col
  const c = [32, 31, 30]; // D mid row
  const d = [43, 40, 37]; // L mid col
  const temp = a.map(i => state[i]);
  for (let i = 0; i < 3; i++) {
    next[a[i]] = state[d[i]];
    next[d[i]] = state[c[i]];
    next[c[i]] = state[b[i]];
    next[b[i]] = temp[i];
  }
  return next;
}

/**
 * Apply a single basic face turn or slice/rotation on a 54-facelet array
 */
export function applyMoveToFacelets(state: FaceletArray, move: NotationMove): FaceletArray {
  const base = move[0] as Face | 'M' | 'E' | 'S' | 'x' | 'y' | 'z';
  const isPrime = move.includes('\'');
  const isDouble = move.includes('2');

  if (base in BASE_PERMUTATIONS) {
    const perm = BASE_PERMUTATIONS[base as Face];
    if (isDouble) {
      return applyPerm(applyPerm(state, perm), perm);
    }
    if (isPrime) {
      return applyPerm(applyPerm(applyPerm(state, perm), perm), perm);
    }
    return applyPerm(state, perm);
  }

  // Slice moves
  if (base === 'M') {
    if (isDouble) return applyM(applyM(state));
    if (isPrime) return applyM(applyM(applyM(state)));
    return applyM(state);
  }
  if (base === 'E') {
    if (isDouble) return applyE(applyE(state));
    if (isPrime) return applyE(applyE(applyE(state)));
    return applyE(state);
  }
  if (base === 'S') {
    if (isDouble) return applyS(applyS(state));
    if (isPrime) return applyS(applyS(applyS(state)));
    return applyS(state);
  }

  // Rotations
  if (base === 'x') {
    const r1 = applyMoveToFacelets(state, isDouble ? 'R2' : (isPrime ? 'R\'' : 'R'));
    const r2 = applyMoveToFacelets(r1, isDouble ? 'M2' : (isPrime ? 'M' : 'M\''));
    return applyMoveToFacelets(r2, isDouble ? 'L2' : (isPrime ? 'L' : 'L\''));
  }
  if (base === 'y') {
    const r1 = applyMoveToFacelets(state, isDouble ? 'U2' : (isPrime ? 'U\'' : 'U'));
    const r2 = applyMoveToFacelets(r1, isDouble ? 'E2' : (isPrime ? 'E' : 'E\''));
    return applyMoveToFacelets(r2, isDouble ? 'D2' : (isPrime ? 'D' : 'D\''));
  }
  if (base === 'z') {
    const r1 = applyMoveToFacelets(state, isDouble ? 'F2' : (isPrime ? 'F\'' : 'F'));
    const r2 = applyMoveToFacelets(r1, isDouble ? 'S2' : (isPrime ? 'S\'' : 'S'));
    return applyMoveToFacelets(r2, isDouble ? 'B2' : (isPrime ? 'B' : 'B\''));
  }

  return state;
}

export function applyMoveToFaceletsInPlace(state: FaceletArray, move: NotationMove): void {
  const updated = applyMoveToFacelets(state, move);
  for (let i = 0; i < 54; i++) {
    state[i] = updated[i];
  }
}

export function applyAlgorithmToFacelets(state: FaceletArray, moves: NotationMove[] | string): FaceletArray {
  const moveList = typeof moves === 'string' ? parseMoves(moves) : moves;
  let current = [...state];
  for (const move of moveList) {
    current = applyMoveToFacelets(current, move);
  }
  return current;
}

export function parseMoves(alg: string): NotationMove[] {
  if (!alg || typeof alg !== 'string') return [];
  const cleaned = alg.replace(/[()[\]{}]/g, ' ').trim();
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const validMoves: NotationMove[] = [];

  for (const token of tokens) {
    const normalized = token.replace(/’/g, '\'').replace(/`/g, '\'');
    if (isValidMoveNotation(normalized)) {
      validMoves.push(normalized as NotationMove);
    }
  }
  return validMoves;
}

export function isValidMoveNotation(move: string): boolean {
  const regex = /^[UDLRFBMESxyz]['2]?$/;
  return regex.test(move);
}

export function invertMove(move: NotationMove): NotationMove {
  if (move.endsWith('2')) return move;
  if (move.endsWith('\'')) return move.slice(0, -1) as NotationMove;
  return `${move}'` as NotationMove;
}

export function invertAlgorithm(moves: NotationMove[] | string): NotationMove[] {
  const moveList = typeof moves === 'string' ? parseMoves(moves) : moves;
  return [...moveList].reverse().map(invertMove);
}

export function getMoveDetails(move: NotationMove, index: number = 0): SolutionStep {
  const base = move[0] as Face | 'M' | 'E' | 'S' | 'x' | 'y' | 'z';
  const isPrime = move.includes('\'');
  const isDouble = move.includes('2');
  const direction = isDouble ? 'DOUBLE' : (isPrime ? 'CCW' : 'CW');

  const faceNames: Record<string, string> = {
    U: 'TOP (UP)',
    D: 'BOTTOM (DOWN)',
    L: 'LEFT',
    R: 'RIGHT',
    F: 'FRONT',
    B: 'BACK',
    M: 'MIDDLE SLICE',
    E: 'EQUATORIAL SLICE',
    S: 'STANDING SLICE',
    x: 'ENTIRE CUBE (X AXIS)',
    y: 'ENTIRE CUBE (Y AXIS)',
    z: 'ENTIRE CUBE (Z AXIS)',
  };

  const faceName = faceNames[base] || base;

  let humanInstruction = '';
  if (base === 'x' || base === 'y' || base === 'z') {
    if (base === 'x') humanInstruction = isDouble ? 'Rotate entire cube 180° away from you (like R2)' : (isPrime ? 'Rotate entire cube toward you (like L)' : 'Rotate entire cube away from you (like R)');
    if (base === 'y') humanInstruction = isDouble ? 'Rotate entire cube 180° horizontally' : (isPrime ? 'Rotate entire cube to the right (like U\')' : 'Rotate entire cube to the left (like U)');
    if (base === 'z') humanInstruction = isDouble ? 'Tilt entire cube 180° sideways' : (isPrime ? 'Tilt entire cube counter-clockwise' : 'Tilt entire cube clockwise');
  } else if (base === 'M' || base === 'E' || base === 'S') {
    humanInstruction = `Turn ${faceName} ${isDouble ? '180°' : (isPrime ? 'counter-clockwise' : 'clockwise')}`;
  } else {
    const dirText = isDouble ? '180° (half turn in either direction)' : (isPrime ? 'COUNTER-CLOCKWISE (quarter turn 90°)' : 'CLOCKWISE (quarter turn 90°)');
    humanInstruction = `Turn the ${faceName} face ${dirText}`;
  }

  let tip = '';
  if (base === 'U') tip = 'Look at the top face from above.';
  else if (base === 'D') tip = 'Look at the bottom face from below.';
  else if (base === 'R') tip = 'Look directly at the right side of the cube.';
  else if (base === 'L') tip = 'Look directly at the left side of the cube.';
  else if (base === 'F') tip = 'Look straight at the front face.';
  else if (base === 'B') tip = 'Look directly at the back side of the cube.';

  return {
    index,
    move,
    face: base,
    direction,
    humanInstruction,
    faceName,
    tip,
  };
}

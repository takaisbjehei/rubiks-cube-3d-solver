import { Face, NotationMove } from '../types/cube';
import { parseMoves } from './moves';

const FACES: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
const MODIFIERS = ['', '\'', '2'];

// Axis mapping to prevent redundant parallel moves
const AXIS_MAP: Record<Face, number> = {
  U: 0,
  D: 0,
  L: 1,
  R: 1,
  F: 2,
  B: 2,
};

/**
 * Generate a high quality WCA-standard random scramble
 * @param length number of moves (default 20)
 */
export function generateScramble(length: number = 20): string {
  const moves: string[] = [];
  let lastAxis = -1;
  let secondLastAxis = -1;

  for (let i = 0; i < length; i++) {
    const validFaces = FACES.filter(face => {
      const axis = AXIS_MAP[face];
      if (axis === lastAxis) return false;
      if (axis === secondLastAxis && lastAxis === secondLastAxis) return false;
      return true;
    });

    const chosenFace = validFaces[Math.floor(Math.random() * validFaces.length)];
    const chosenMod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    const move = `${chosenFace}${chosenMod}`;

    moves.push(move);
    secondLastAxis = lastAxis;
    lastAxis = AXIS_MAP[chosenFace];
  }

  return moves.join(' ');
}

export function generateScrambleMoves(length: number = 20): NotationMove[] {
  return parseMoves(generateScramble(length));
}

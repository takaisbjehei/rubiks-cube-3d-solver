import { CubePattern } from '../types/cube';

export const POPULAR_PATTERNS: CubePattern[] = [
  {
    name: 'Checkerboard',
    category: 'Classic',
    description: 'Alternates colors on every face, creating a classic chess-board appearance on all 6 sides.',
    moves: 'M2 E2 S2',
  },
  {
    name: 'Cube in a Cube',
    category: 'Optical Illusion',
    description: 'Creates a mini 2×2 sub-cube nested in one corner with the remaining faces forming a frame.',
    moves: 'F L F U\' R U F2 L2 U\' L\' B D\' B\' L2 U',
  },
  {
    name: 'Superflip',
    category: 'Mathematical',
    description: 'The farthest reachable state in God\'s Number (20 moves) — all 12 edges are flipped in place with corners solved.',
    moves: 'U R2 F B R B2 R U2 L B2 R U\' D\' R2 F R\' L B2 U2 F2',
  },
  {
    name: 'Six-Spot / Center Dots',
    category: 'Classic',
    description: 'Swaps each center piece with the opposite color, placing dots in the middle of all faces.',
    moves: 'U D\' R L\' F B\' U D\'',
  },
  {
    name: 'Cross Pattern',
    category: 'Geometric',
    description: 'Forms bold intersecting geometric crosses on 4 sides with checkerboard caps.',
    moves: 'R2 L\' D F2 R\' D\' R\' L U\' D R D\' B2 R\' U D2',
  },
  {
    name: 'Anaconda',
    category: 'Snakes & Spirals',
    description: 'A continuous snake winding around the perimeter of the cube.',
    moves: 'L U B\' U\' R L\' B R\' F B\' D R D\' F\'',
  },
  {
    name: 'Python',
    category: 'Snakes & Spirals',
    description: 'A spiraling path that wraps across all 6 faces.',
    moves: 'F2 R\' B\' U R\' L F\' L F\' B D\' R B L2',
  },
  {
    name: 'Cube in a Cube in a Cube',
    category: 'Optical Illusion',
    description: 'A 1×1 cube inside a 2×2 cube inside the 3×3 cube.',
    moves: 'U\' L\' U\' F\' R2 B\' R F U B2 U B\' L U\' F U R F\'',
  },
  {
    name: 'Tetris',
    category: 'Art',
    description: 'T-shaped and L-shaped block arrangements resembling Tetris tetrominoes.',
    moves: 'L R F B U\' D\' L\' R\'',
  },
  {
    name: 'Twister / Spiral',
    category: 'Geometric',
    description: 'Dynamic rotational spiral twisting along the primary diagonal axis.',
    moves: 'F R\' F R2 U\' R\' U\' R U\' R\' U2',
  },
];

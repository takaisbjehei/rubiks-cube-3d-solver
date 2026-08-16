import { Face, CubeColor, FaceletColorMap } from '../types/cube';

export const DEFAULT_FACE_COLORS: FaceletColorMap = {
  U: 'white',
  R: 'red',
  F: 'green',
  D: 'yellow',
  L: 'orange',
  B: 'blue',
};

export const COLOR_HEX: Record<CubeColor, string> = {
  white: '#F8FAFC',   // Clean crisp speedcube white
  yellow: '#FACC15',  // Vibrant tournament yellow
  red: '#EF4444',     // Speedcube red
  orange: '#F97316',  // Vivid neon orange
  blue: '#2563EB',    // Deep electric blue
  green: '#10B981',   // Emerald bright green
};

export const COLOR_NAMES: Record<CubeColor, string> = {
  white: 'White',
  yellow: 'Yellow',
  red: 'Red',
  orange: 'Orange',
  blue: 'Blue',
  green: 'Green',
};

export const FACE_NAMES: Record<Face, string> = {
  U: 'Up (Top)',
  R: 'Right',
  F: 'Front',
  D: 'Down (Bottom)',
  L: 'Left',
  B: 'Back',
};

export const FACE_ORDER: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export const FACE_BASE_INDICES: Record<Face, number> = {
  U: 0,
  R: 9,
  F: 18,
  D: 27,
  L: 36,
  B: 45,
};

export const CENTER_INDICES: Record<Face, number> = {
  U: 4,
  R: 13,
  F: 22,
  D: 31,
  L: 40,
  B: 49,
};

// Standard facelet order definitions for corners:
// Corner 0: URF (U8, R0, F2) -> (8, 9, 20)
// Corner 1: UFL (U6, F0, L2) -> (6, 18, 38)
// Corner 2: ULB (U0, L0, B2) -> (0, 36, 47)
// Corner 3: UBR (U2, B0, R2) -> (2, 45, 11)
// Corner 4: DFR (D2, F8, R6) -> (29, 26, 15)
// Corner 5: DLF (D0, L8, F6) -> (27, 44, 24)
// Corner 6: DBL (D6, B8, L6) -> (33, 53, 42)
// Corner 7: DRB (D8, R8, B6) -> (35, 17, 51)
export const CORNER_FACELETS: [number, number, number][] = [
  [8, 9, 20],   // URF: U9, R1, F3
  [6, 18, 38],  // UFL: U7, F1, L3
  [0, 36, 47],  // ULB: U1, L1, B3
  [2, 45, 11],  // UBR: U3, B1, R3
  [29, 26, 15], // DFR: D3, F9, R7
  [27, 44, 24], // DLF: D1, L9, F7
  [33, 53, 42], // DBL: D7, B9, L7
  [35, 17, 51], // DRB: D9, R9, B7
];

// Standard facelet order definitions for edges:
// Edge 0: UR (U5, R1) -> (5, 10)
// Edge 1: UF (U7, F1) -> (7, 19)
// Edge 2: UL (U3, L1) -> (3, 37)
// Edge 3: UB (U1, B1) -> (1, 46)
// Edge 4: DR (D5, R7) -> (32, 16)
// Edge 5: DF (D1, F7) -> (28, 25)
// Edge 6: DL (D3, L7) -> (30, 43)
// Edge 7: DB (D7, B7) -> (34, 52)
// Edge 8: FR (F5, R3) -> (23, 12)
// Edge 9: FL (F3, L5) -> (21, 39)
// Edge 10: BL (B3, L3) -> (48, 41)
// Edge 11: BR (B5, R5) -> (50, 14)
export const EDGE_FACELETS: [number, number][] = [
  [5, 10],   // UR
  [7, 19],   // UF
  [3, 37],   // UL
  [1, 46],   // UB
  [32, 16],  // DR
  [28, 25],  // DF
  [30, 43],  // DL
  [34, 52],  // DB
  [23, 12],  // FR
  [21, 41],  // FL
  [50, 39],  // BL
  [48, 14],  // BR
];

export const SOLVED_FACELETS: CubeColor[] = [
  ...Array(9).fill('white'),   // U: 0..8
  ...Array(9).fill('red'),     // R: 9..17
  ...Array(9).fill('green'),   // F: 18..26
  ...Array(9).fill('yellow'),  // D: 27..35
  ...Array(9).fill('orange'),  // L: 36..44
  ...Array(9).fill('blue'),    // B: 45..53
];

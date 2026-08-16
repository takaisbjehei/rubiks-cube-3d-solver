export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export type CubeColor = 'white' | 'yellow' | 'red' | 'orange' | 'blue' | 'green';

export type NotationMove = 
  | 'U' | 'U\'' | 'U2'
  | 'D' | 'D\'' | 'D2'
  | 'L' | 'L\'' | 'L2'
  | 'R' | 'R\'' | 'R2'
  | 'F' | 'F\'' | 'F2'
  | 'B' | 'B\'' | 'B2'
  | 'M' | 'M\'' | 'M2'
  | 'E' | 'E\'' | 'E2'
  | 'S' | 'S\'' | 'S2'
  | 'x' | 'x\'' | 'x2'
  | 'y' | 'y\'' | 'y2'
  | 'z' | 'z\'' | 'z2';

export interface FaceletColorMap {
  U: CubeColor; // default: white
  D: CubeColor; // default: yellow
  L: CubeColor; // default: orange
  R: CubeColor; // default: red
  F: CubeColor; // default: green
  B: CubeColor; // default: blue
}

export type FaceletArray = CubeColor[]; // 54 elements: U0..U8, R0..R8, F0..F8, D0..D8, L0..L8, B0..B8

export interface SolutionStep {
  index: number;
  move: NotationMove;
  face: Face | 'M' | 'E' | 'S' | 'x' | 'y' | 'z';
  direction: 'CW' | 'CCW' | 'DOUBLE';
  humanInstruction: string;
  faceName: string;
  tip?: string;
}

export interface ValidationDetail {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  counts: Record<CubeColor, number>;
  parityStatus?: {
    cornerPermutationParity: boolean;
    edgePermutationParity: boolean;
    cornerOrientationParity: boolean;
    edgeOrientationParity: boolean;
    totalPermutationParity: boolean;
  };
}

export interface MoveRecord {
  move: NotationMove;
  timestamp: number;
}

export interface SolveRecord {
  id: string;
  date: string;
  timeMs: number;
  moves: number;
  tps: number;
  scramble: string;
}

export interface CubePattern {
  name: string;
  category: string;
  description: string;
  moves: string;
}

export type ViewPreset = 'default' | 'front' | 'top' | 'right' | 'left' | 'back' | 'bottom';

export type AppMode = 'virtual' | 'input' | 'solver' | 'patterns';

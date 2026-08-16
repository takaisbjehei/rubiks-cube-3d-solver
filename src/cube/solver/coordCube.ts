import { FaceletArray, FaceletColorMap, NotationMove } from '../../types/cube';
import { CORNER_FACELETS, EDGE_FACELETS, CENTER_INDICES } from '../constants';

export const N_TWIST = 2187; // 3^7
export const N_FLIP = 2048;  // 2^11
export const N_SLICE1 = 495; // 12!/(4!*8!)
export const N_SLICE2 = 24;  // 4!
export const N_PARITY = 2;
export const N_URFtoDLF = 20160; // 8!/2!
export const N_FRtoBR = 11880;   // 12!/8!
export const N_URtoUL = 1320;    // 12!/9!
export const N_UBtoDF = 1320;    // 12!/9!
export const N_URtoDF = 20160;   // 8!/2!
export const N_CORNERS = 40320;  // 8!
export const N_EDGES = 40320;    // 8!

// Corner enum: URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB
export const enum Corner {
  URF = 0, UFL = 1, ULB = 2, UBR = 3,
  DFR = 4, DLF = 5, DBL = 6, DRB = 7
}

// Edge enum: UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR
export const enum Edge {
  UR = 0, UF = 1, UL = 2, UB = 3,
  DR = 4, DF = 5, DL = 6, DB = 7,
  FR = 8, FL = 9, BL = 10, BR = 11
}

// Combinations C(n, k)
export function C_n_k(n: number, k: number): number {
  if (n < k || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - i + 1)) / i;
  }
  return res;
}

/**
 * Representation of a Cube in terms of Corner and Edge Permutations & Orientations
 */
export class CubieCube {
  cp: Corner[] = [0, 1, 2, 3, 4, 5, 6, 7];
  co: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  ep: Edge[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  eo: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  clone(): CubieCube {
    const c = new CubieCube();
    c.cp = [...this.cp];
    c.co = [...this.co];
    c.ep = [...this.ep];
    c.eo = [...this.eo];
    return c;
  }

  // Multiply two cubie cubes: this * other
  multiply(other: CubieCube): CubieCube {
    const res = new CubieCube();

    // Corner permutation & orientation
    for (let c = 0; c < 8; c++) {
      res.cp[c] = this.cp[other.cp[c]];
      const oriA = this.co[other.cp[c]];
      const oriB = other.co[c];
      let ori = oriA + oriB;
      if (ori >= 3) ori -= 3;
      res.co[c] = ori;
    }

    // Edge permutation & orientation
    for (let e = 0; e < 12; e++) {
      res.ep[e] = this.ep[other.ep[e]];
      const oriA = this.eo[other.ep[e]];
      const oriB = other.eo[e];
      res.eo[e] = (oriA + oriB) % 2;
    }

    return res;
  }

  getTwist(): number {
    let ret = 0;
    for (let i = 0; i < 7; i++) {
      ret = 3 * ret + this.co[i];
    }
    return ret;
  }

  setTwist(twist: number) {
    let twistParity = 0;
    for (let i = 6; i >= 0; i--) {
      this.co[i] = twist % 3;
      twistParity += this.co[i];
      twist = Math.floor(twist / 3);
    }
    this.co[7] = (3 - (twistParity % 3)) % 3;
  }

  getFlip(): number {
    let ret = 0;
    for (let i = 0; i < 11; i++) {
      ret = 2 * ret + this.eo[i];
    }
    return ret;
  }

  setFlip(flip: number) {
    let flipParity = 0;
    for (let i = 10; i >= 0; i--) {
      this.eo[i] = flip % 2;
      flipParity += this.eo[i];
      flip = Math.floor(flip / 2);
    }
    this.eo[11] = (2 - (flipParity % 2)) % 2;
  }

  // Phase 1 Slice: combination of 4 middle slice edges (FR, FL, BL, BR) in 12 edge positions
  getSlice(): number {
    let a = 0;
    let x = 0;
    for (let j = 11; j >= 0; j--) {
      if (this.ep[j] >= 8 && this.ep[j] <= 11) {
        a += C_n_k(11 - j, x + 1);
        x++;
      }
    }
    return a;
  }

  // Phase 2 Middle Slice permutation (0..23)
  getSliceSorted(): number {
    let a = 0;
    let x = 0;
    const sliceEdge: number[] = [];
    for (let j = 0; j < 12; j++) {
      if (this.ep[j] >= 8 && this.ep[j] <= 11) {
        sliceEdge.push(this.ep[j] - 8);
      }
    }
    for (let j = 3; j >= 1; j--) {
      let s = 0;
      for (let k = j - 1; k >= 0; k--) {
        if (sliceEdge[k] > sliceEdge[j]) s++;
      }
      a = (a + s) * j;
    }
    return a;
  }

  // Corner permutation coordinate (0..40319)
  getCPerm(): number {
    let a = 0;
    for (let j = 7; j >= 1; j--) {
      let s = 0;
      for (let k = j - 1; k >= 0; k--) {
        if (this.cp[k] > this.cp[j]) s++;
      }
      a = (a + s) * j;
    }
    return a;
  }

  // U/D 8 edges permutation coordinate (0..40319)
  getEPerm(): number {
    let a = 0;
    for (let j = 7; j >= 1; j--) {
      let s = 0;
      for (let k = j - 1; k >= 0; k--) {
        if (this.ep[k] > this.ep[j]) s++;
      }
      a = (a + s) * j;
    }
    return a;
  }
}

// 6 Basic Move Cubie Definitions (U, R, F, D, L, B)
export const MOVE_CUBIES: CubieCube[] = [];

function initMoveCubies() {
  // U Move
  const U = new CubieCube();
  U.cp = [Corner.UBR, Corner.URF, Corner.UFL, Corner.ULB, Corner.DFR, Corner.DLF, Corner.DBL, Corner.DRB];
  U.co = [0, 0, 0, 0, 0, 0, 0, 0];
  U.ep = [Edge.UB, Edge.UR, Edge.UF, Edge.UL, Edge.DR, Edge.DF, Edge.DL, Edge.DB, Edge.FR, Edge.FL, Edge.BL, Edge.BR];
  U.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // R Move
  const R = new CubieCube();
  R.cp = [Corner.DFR, Corner.UFL, Corner.ULB, Corner.URF, Corner.DRB, Corner.DLF, Corner.DBL, Corner.UBR];
  R.co = [2, 0, 0, 1, 1, 0, 0, 2];
  R.ep = [Edge.FR, Edge.UF, Edge.UL, Edge.UB, Edge.BR, Edge.DF, Edge.DL, Edge.DB, Edge.DR, Edge.FL, Edge.BL, Edge.UR];
  R.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // F Move
  const F = new CubieCube();
  F.cp = [Corner.UFL, Corner.DLF, Corner.ULB, Corner.UBR, Corner.URF, Corner.DFR, Corner.DBL, Corner.DRB];
  F.co = [1, 2, 0, 0, 2, 1, 0, 0];
  F.ep = [Edge.UR, Edge.FL, Edge.UL, Edge.UB, Edge.DR, Edge.FR, Edge.DL, Edge.DB, Edge.UF, Edge.DF, Edge.BL, Edge.BR];
  F.eo = [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0];

  // D Move
  const D = new CubieCube();
  D.cp = [Corner.URF, Corner.UFL, Corner.ULB, Corner.UBR, Corner.DLF, Corner.DBL, Corner.DRB, Corner.DFR];
  D.co = [0, 0, 0, 0, 0, 0, 0, 0];
  D.ep = [Edge.UR, Edge.UF, Edge.UL, Edge.UB, Edge.DF, Edge.DL, Edge.DB, Edge.DR, Edge.FR, Edge.FL, Edge.BL, Edge.BR];
  D.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // L Move
  const L = new CubieCube();
  L.cp = [Corner.URF, Corner.ULB, Corner.DBL, Corner.UBR, Corner.DFR, Corner.UFL, Corner.DLF, Corner.DRB];
  L.co = [0, 1, 2, 0, 0, 2, 1, 0];
  L.ep = [Edge.UR, Edge.UF, Edge.BL, Edge.UB, Edge.DR, Edge.DF, Edge.FL, Edge.DB, Edge.FR, Edge.UL, Edge.DL, Edge.BR];
  L.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // B Move
  const B = new CubieCube();
  B.cp = [Corner.URF, Corner.UFL, Corner.UBR, Corner.DRB, Corner.DFR, Corner.DLF, Corner.ULB, Corner.DBL];
  B.co = [0, 0, 1, 2, 0, 0, 2, 1];
  B.ep = [Edge.UR, Edge.UF, Edge.UL, Edge.BR, Edge.DR, Edge.DF, Edge.DL, Edge.BL, Edge.FR, Edge.FL, Edge.UB, Edge.DB];
  B.eo = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1];

  const basic = [U, R, F, D, L, B];
  // 18 moves: U, U2, U', R, R2, R', F, F2, F', D, D2, D', L, L2, L', B, B2, B'
  for (let i = 0; i < 6; i++) {
    let cur = new CubieCube();
    for (let p = 0; p < 3; p++) {
      cur = cur.multiply(basic[i]);
      MOVE_CUBIES[i * 3 + p] = cur.clone();
    }
  }
}

initMoveCubies();

export const MOVE_NAMES: NotationMove[] = [
  'U', 'U2', 'U\'',
  'R', 'R2', 'R\'',
  'F', 'F2', 'F\'',
  'D', 'D2', 'D\'',
  'L', 'L2', 'L\'',
  'B', 'B2', 'B\''
];

/**
 * Convert 54-facelet array into CubieCube representation
 */
export function faceletsToCubieCube(facelets: FaceletArray): CubieCube {
  const cc = new CubieCube();
  
  // Center color mapping
  const colorToFace: Record<string, string> = {
    [facelets[CENTER_INDICES.U]]: 'U',
    [facelets[CENTER_INDICES.R]]: 'R',
    [facelets[CENTER_INDICES.F]]: 'F',
    [facelets[CENTER_INDICES.D]]: 'D',
    [facelets[CENTER_INDICES.L]]: 'L',
    [facelets[CENTER_INDICES.B]]: 'B',
  };

  const cornerFaceletLetters: [string, string, string][] = [
    ['U', 'R', 'F'], // URF
    ['U', 'F', 'L'], // UFL
    ['U', 'L', 'B'], // ULB
    ['U', 'B', 'R'], // UBR
    ['D', 'F', 'R'], // DFR
    ['D', 'L', 'F'], // DLF
    ['D', 'B', 'L'], // DBL
    ['D', 'R', 'B'], // DRB
  ];

  for (let i = 0; i < 8; i++) {
    const [f1, f2, f3] = CORNER_FACELETS[i];
    const c1 = colorToFace[facelets[f1]] || 'U';
    const c2 = colorToFace[facelets[f2]] || 'R';
    const c3 = colorToFace[facelets[f3]] || 'F';

    // Find orientation (U or D color face)
    let ori = 0;
    if (c1 === 'U' || c1 === 'D') ori = 0;
    else if (c2 === 'U' || c2 === 'D') ori = 1;
    else if (c3 === 'U' || c3 === 'D') ori = 2;

    // Find corner permutation
    const colors = [c1, c2, c3];
    for (let c = 0; c < 8; c++) {
      const target = cornerFaceletLetters[c];
      if (colors.includes(target[0]) && colors.includes(target[1]) && colors.includes(target[2])) {
        cc.cp[i] = c;
        cc.co[i] = ori;
        break;
      }
    }
  }

  const edgeFaceletLetters: [string, string][] = [
    ['U', 'R'], ['U', 'F'], ['U', 'L'], ['U', 'B'],
    ['D', 'R'], ['D', 'F'], ['D', 'L'], ['D', 'B'],
    ['F', 'R'], ['F', 'L'], ['B', 'L'], ['B', 'R'],
  ];

  for (let i = 0; i < 12; i++) {
    const [f1, f2] = EDGE_FACELETS[i];
    const c1 = colorToFace[facelets[f1]] || 'U';
    const c2 = colorToFace[facelets[f2]] || 'R';

    let ori = 0;
    if (c1 === 'U' || c1 === 'D') ori = 0;
    else if (c2 === 'U' || c2 === 'D') ori = 1;
    else if (c1 === 'F' || c1 === 'B') ori = 0;
    else if (c2 === 'F' || c2 === 'B') ori = 1;

    const colors = [c1, c2];
    for (let e = 0; e < 12; e++) {
      const target = edgeFaceletLetters[e];
      if (colors.includes(target[0]) && colors.includes(target[1])) {
        cc.ep[i] = e;
        cc.eo[i] = ori;
        break;
      }
    }
  }

  return cc;
}
